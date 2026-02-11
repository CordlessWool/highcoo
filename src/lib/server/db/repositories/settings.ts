import type { SettingsRepository } from './types';
import type { db as database } from '../index';
import { defaultSettings } from '$lib/logic/settings';
import * as table from '../schema';

export const createSettingsRepository = (db: typeof database): SettingsRepository => ({
	async get() {
		const row = await db.select().from(table.settings).limit(1).get();
		return {
			...defaultSettings,
			...row
		};
	},

	async patch(data) {
		await db
			.insert(table.settings)
			.values({ id: 1, ...data })
			.onConflictDoUpdate({ target: table.settings.id, set: data });
	}
});
