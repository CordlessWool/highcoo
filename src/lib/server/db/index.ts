import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';

let _db: ReturnType<typeof drizzle> | undefined;

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
	get(_, prop) {
		if (!_db) {
			if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
			_db = drizzle({ client: postgres(env.DATABASE_URL) });
		}
		return Reflect.get(_db, prop);
	}
});
