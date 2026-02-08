export const softDeleteMedia = async (ids: string[]): Promise<boolean> => {
	const res = await fetch('/media', {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ ids })
	});
	return res.ok;
};

export const restoreMedia = async (ids: string[]): Promise<boolean> => {
	const res = await fetch('/media/restore', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ ids })
	});
	return res.ok;
};
