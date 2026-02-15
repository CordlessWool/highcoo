import {
	blob,
	integer,
	primaryKey,
	real,
	sqliteTable,
	text,
	uniqueIndex
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { WatermarkPosition } from '../../logic/settings';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const credential = sqliteTable('credential', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	publicKey: blob('public_key', { mode: 'buffer' }).notNull(),
	counter: integer('counter').notNull(),
	transports: text('transports'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const file = sqliteTable('file', {
	hash: text('hash').primaryKey(),
	path: text('path').notNull(),
	mimeType: text('mime_type').notNull(),
	size: integer('size').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export type File = typeof file.$inferSelect;

export const media = sqliteTable(
	'media',
	{
		id: text('id').primaryKey(),
		fileHash: text('file_hash')
			.notNull()
			.references(() => file.hash),
		name: text('name').notNull(),
		slug: text('slug').notNull(),
		description: text('description'),
		dirty: integer('dirty', { mode: 'boolean' }).notNull().default(true),
		publishedAt: integer('published_at', { mode: 'timestamp' }),
		updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
		deletedAt: integer('deleted_at', { mode: 'timestamp' })
	},
	(table) => [
		uniqueIndex('media_file_hash_draft')
			.on(table.fileHash)
			.where(sql`published_at IS NULL`),
		uniqueIndex('media_slug_draft')
			.on(table.slug)
			.where(sql`published_at IS NULL`)
	]
);

export type Media = typeof media.$inferSelect;

export const tag = sqliteTable('tag', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	color: text('color'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export type Tag = typeof tag.$inferSelect;
export type NewTag = Omit<typeof tag.$inferInsert, 'createdAt'>;

export const mediaTag = sqliteTable(
	'media_tag',
	{
		mediaId: text('media_id')
			.notNull()
			.references(() => media.id),
		tagId: text('tag_id')
			.notNull()
			.references(() => tag.id)
	},
	(table) => [primaryKey({ columns: [table.mediaId, table.tagId] })]
);

export type MediaTag = typeof mediaTag.$inferSelect;

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export type Credential = typeof credential.$inferSelect;

export const settings = sqliteTable('settings', {
	id: integer('id')
		.primaryKey()
		.$defaultFn(() => 1),
	watermarkFileHash: text('watermark_file_hash').references(() => file.hash),
	watermarkPosition: text('watermark_position').notNull().default(WatermarkPosition.BottomRight),
	watermarkOpacity: real('watermark_opacity').notNull().default(0.5)
});

export type Settings = typeof settings.$inferSelect;
