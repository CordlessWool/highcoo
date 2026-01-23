export const softDeletePhotos = async (hashes: string[]): Promise<boolean> => {
	const res = await fetch('/photos', {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ hashes })
	});
	return res.ok;
};

export const restorePhotos = async (hashes: string[]): Promise<boolean> => {
	const res = await fetch('/photos/restore', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ hashes })
	});
	return res.ok;
};
