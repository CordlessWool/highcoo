import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', { id: text('id').primaryKey(), age: integer('age') });

export const file = sqliteTable('file', {
	hash: text('hash').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	path: text('path').notNull(),
	mimeType: text('mime_type').notNull(),
	size: integer('size').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	deletedAt: integer('deleted_at', { mode: 'timestamp' })
});

export type File = typeof file.$inferSelect;

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
