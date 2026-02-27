import {
	boolean,
	bytea,
	index,
	integer,
	pgTable,
	primaryKey,
	real,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	type AnyPgColumn
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { WatermarkPosition } from '../../logic/settings';

const uuidv7pk = () =>
	uuid()
		.primaryKey()
		.default(sql`uuidv7()`);

export const user = pgTable('user', {
	id: uuidv7pk()
});

export const credential = pgTable('credential', {
	id: text('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id),
	publicKey: bytea('public_key').notNull(),
	counter: integer('counter').notNull(),
	transports: text('transports')
});

export const file = pgTable('file', {
	hash: text('hash').primaryKey(),
	path: text('path').notNull(),
	mimeType: text('mime_type').notNull(),
	size: integer('size').notNull()
});

export type File = typeof file.$inferSelect;

export const media = pgTable(
	'media',
	{
		id: uuidv7pk(),
		fileHash: text('file_hash')
			.notNull()
			.references(() => file.hash),
		name: text('name').notNull(),
		slug: text('slug').notNull(),
		description: text('description'),
		draftId: uuid('draft_id')
			.notNull()
			.references((): AnyPgColumn => media.id),
		dirty: boolean('dirty').notNull().default(true),
		publishedAt: timestamp('published_at'),
		updatedAt: timestamp('updated_at').notNull(),
		deletedAt: timestamp('deleted_at')
	},
	(table) => [
		uniqueIndex('media_file_hash_draft')
			.on(table.fileHash)
			.where(sql`published_at IS NULL`),
		uniqueIndex('media_slug_draft')
			.on(table.slug)
			.where(sql`published_at IS NULL`),
		index('media_search_idx')
			.using('gin', sql`(setweight(to_tsvector('simple', ${table.name}), 'A') || setweight(to_tsvector('simple', coalesce(${table.description}, '')), 'B'))`)
	]
);

export type Media = typeof media.$inferSelect;

export const tag = pgTable('tag', {
	id: uuidv7pk(),
	name: text('name').notNull(),
	color: text('color')
});

export type Tag = typeof tag.$inferSelect;
export type NewTag = Omit<typeof tag.$inferInsert, 'id'>;

export const tagContent = pgTable(
	'tag_content',
	{
		id: uuidv7pk(),
		tagId: uuid('tag_id')
			.notNull()
			.references(() => tag.id, { onDelete: 'cascade' }),
		title: text('title'),
		slug: text('slug').notNull(),
		description: text('description'),
		dirty: boolean('dirty').notNull().default(true),
		publishedAt: timestamp('published_at'),
		updatedAt: timestamp('updated_at').notNull()
	},
	(table) => [
		uniqueIndex('tag_content_tag_id_draft')
			.on(table.tagId)
			.where(sql`published_at IS NULL`),
		uniqueIndex('tag_content_slug_draft')
			.on(table.slug)
			.where(sql`published_at IS NULL`)
	]
);

export type TagContent = typeof tagContent.$inferSelect;

export const mediaTag = pgTable(
	'media_tag',
	{
		mediaId: uuid('media_id')
			.notNull()
			.references(() => media.id),
		tagId: uuid('tag_id')
			.notNull()
			.references(() => tag.id)
	},
	(table) => [primaryKey({ columns: [table.mediaId, table.tagId] })]
);

export type MediaTag = typeof mediaTag.$inferSelect;

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at').notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export type Credential = typeof credential.$inferSelect;

export const settings = pgTable('settings', {
	id: integer('id')
		.primaryKey()
		.$defaultFn(() => 1),
	watermarkFileHash: text('watermark_file_hash').references(() => file.hash),
	watermarkPosition: text('watermark_position').notNull().default(WatermarkPosition.BottomRight),
	watermarkOpacity: real('watermark_opacity').notNull().default(0.5)
});

export type Settings = typeof settings.$inferSelect;
