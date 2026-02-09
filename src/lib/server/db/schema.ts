import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', { id: text('id').primaryKey(), age: integer('age') });

export const file = sqliteTable('file', {
	hash: text('hash').primaryKey(),
	path: text('path').notNull(),
	mimeType: text('mime_type').notNull(),
	size: integer('size').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export type File = typeof file.$inferSelect;

export const media = sqliteTable('media', {
	id: text('id').primaryKey(),
	fileHash: text('file_hash')
		.notNull()
		.unique()
		.references(() => file.hash),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	deletedAt: integer('deleted_at', { mode: 'timestamp' })
});

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
