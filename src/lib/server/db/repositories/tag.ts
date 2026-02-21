import { and, asc, eq, gt, ilike, inArray, lte, or, sql } from 'drizzle-orm';
import * as v from 'valibot';
import type { TagRepository, Pagination, PaginatedResult } from './types';
import type { db as database } from '../index';
import * as table from '../schema';
import type { Tag, TagWithStatus, TagFilter, NewTag } from '$lib/logic/tag';
import { encodeCursor, decodeCursor } from '$lib/logic/pagination';
import { type QueryDef, emptyDef, execute } from './query';

const tagCursorSchema = v.object({ id: v.string(), value: v.string() });

// --- Status fields ---

const statusFields = {
	id: table.tag.id,
	name: table.tag.name,
	color: table.tag.color,
	hasDraft: sql<boolean>`EXISTS (
		SELECT 1 FROM tag_content
		WHERE tag_id = tag.id AND published_at IS NULL
	)`,
	isDirty: sql<boolean>`COALESCE((
		SELECT dirty FROM tag_content
		WHERE tag_id = tag.id AND published_at IS NULL
		LIMIT 1
	), false)`,
	isPublished: sql<boolean>`EXISTS (
		SELECT 1 FROM tag_content
		WHERE tag_id = tag.id AND published_at IS NOT NULL
	)`
};

export const createTagRepository = (db: typeof database): TagRepository => {
	// --- Pipeline filter functions ---

	function withSearch(def: QueryDef, filter?: TagFilter): QueryDef {
		if (!filter?.search) return def;
		return { ...def, conditions: [...def.conditions, ilike(table.tag.name, `%${filter.search}%`)] };
	}

	function withCursorAfter(def: QueryDef, pagination?: Pagination): QueryDef {
		const cursor = pagination?.cursor ? decodeCursor(pagination.cursor, tagCursorSchema) : null;
		if (!cursor) return def;
		const cond = or(
			gt(table.tag.name, cursor.value),
			and(eq(table.tag.name, cursor.value), gt(table.tag.id, cursor.id))
		);
		return { ...def, conditions: [...def.conditions, cond] };
	}

	function withCursorBefore(def: QueryDef, pagination?: Pagination): QueryDef {
		const cursor = pagination?.cursor ? decodeCursor(pagination.cursor, tagCursorSchema) : null;
		if (!cursor) return def;
		const cond = or(
			lte(table.tag.name, cursor.value),
			and(eq(table.tag.name, cursor.value), lte(table.tag.id, cursor.id))
		);
		return { ...def, conditions: [...def.conditions, cond] };
	}

	function withOrder(def: QueryDef): QueryDef {
		return { ...def, orderBy: [...def.orderBy, asc(table.tag.name), asc(table.tag.id)] };
	}

	function withLimit(def: QueryDef, limit: number): QueryDef {
		return { ...def, limit };
	}

	return {
	async create(input: NewTag): Promise<Tag> {
		const [tag] = await db
			.insert(table.tag)
			.values({ name: input.name, color: input.color ?? null })
			.returning();
		return tag;
	},

	async findAll(filter?: TagFilter, pagination?: Pagination): Promise<PaginatedResult<Tag>> {
		const limit = pagination?.limit ?? 24;
		const orderBy = pagination?.orderBy ?? 'name';

		let def = emptyDef();
		def = withSearch(def, filter);
		def = withCursorAfter(def, pagination);
		def = withOrder(def);
		def = withLimit(def, limit + 1);

		const q = db.select({ id: table.tag.id, name: table.tag.name, color: table.tag.color }).from(table.tag).$dynamic();
		const rows = await execute(q, def);
		const hasMore = rows.length > limit;
		const page = hasMore ? rows.slice(0, limit) : rows;
		const last = page[page.length - 1];
		const nextCursor = hasMore && last ? encodeCursor({ value: last.name, id: last.id }) : null;

		return {
			items: page,
			pagination: { limit, orderBy, cursor: nextCursor }
		};
	},

	async findAllIds(filter?: TagFilter, pagination?: Pagination): Promise<PaginatedResult<string>> {
		const limit = pagination?.limit ?? 24;
		const orderBy = pagination?.orderBy ?? 'name';

		let def = emptyDef();
		def = withSearch(def, filter);
		def = withCursorAfter(def, pagination);
		def = withOrder(def);
		def = withLimit(def, limit + 1);

		const q = db.select({ id: table.tag.id, name: table.tag.name }).from(table.tag).$dynamic();
		const rows = await execute(q, def);
		const hasMore = rows.length > limit;
		const page = hasMore ? rows.slice(0, limit) : rows;
		const last = page[page.length - 1];
		const nextCursor = hasMore && last ? encodeCursor({ value: last.name, id: last.id }) : null;

		return {
			items: page.map((r) => r.id),
			pagination: { limit, orderBy, cursor: nextCursor }
		};
	},

	async findCurrentIds(filter?: TagFilter, pagination?: Pagination): Promise<string[]> {
		let def = emptyDef();
		def = withSearch(def, filter);
		def = withCursorBefore(def, pagination);
		def = withOrder(def);

		const q = db.select({ id: table.tag.id, name: table.tag.name }).from(table.tag).$dynamic();
		const rows = await execute(q, def);
		return rows.map((r) => r.id);
	},

	async findWithStatusByIds(ids: string[]): Promise<TagWithStatus[]> {
		if (ids.length === 0) return [];
		return db.select(statusFields).from(table.tag).where(inArray(table.tag.id, ids));
	},

	async findById(id: string): Promise<Tag | null> {
		const [result] = await db.select().from(table.tag).where(eq(table.tag.id, id)).limit(1);
		return result ?? null;
	},

	async patch(id: string, data: Partial<Omit<Tag, 'id'>>): Promise<void> {
		await db.update(table.tag).set(data).where(eq(table.tag.id, id));
	},

	async delete(id: string): Promise<void> {
		await db.delete(table.tag).where(eq(table.tag.id, id));
	}
}};
