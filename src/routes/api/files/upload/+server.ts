import { json } from '@sveltejs/kit';
import * as v from 'valibot';
import type { RequestHandler } from './$types';
import { FileUpload } from '$lib/logic/upload';
import { saveFile } from '$lib/server/files';
import { storage } from '$lib/server/storage';
import { fileRepository } from '$lib/server/db/repositories';

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();

	const { file, hash } = v.parse(FileUpload, {
		file: formData.get('file'),
		hash: formData.get('hash')
	});

	const result = await saveFile({ file, hash }, { storage, fileRepository });

	return json({ success: true, ...result });
};
