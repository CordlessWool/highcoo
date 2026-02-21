import { and } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import type { PgSelect } from 'drizzle-orm/pg-core';

export type QueryDef = {
	conditions: (SQL | undefined)[];
	joins: (<T extends PgSelect>(q: T) => T)[];
	orderBy: SQL[];
	limit?: number;
};

export function emptyDef(): QueryDef {
	return { conditions: [], joins: [], orderBy: [] };
}

export function execute<T extends PgSelect>(query: T, def: QueryDef) {
	for (const join of def.joins) query = join(query);
	let q = query.where(and(...def.conditions));
	if (def.orderBy.length) q = q.orderBy(...def.orderBy);
	if (def.limit) q = q.limit(def.limit);
	return q;
}
