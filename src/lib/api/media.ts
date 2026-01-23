export const softDeleteMedia = async (hashes: string[]): Promise<boolean> => {
	const res = await fetch('/media', {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ hashes })
	});
	return res.ok;
};

export const restoreMedia = async (hashes: string[]): Promise<boolean> => {
	const res = await fetch('/media/restore', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ hashes })
	});
	return res.ok;
};
