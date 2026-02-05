import type { Tag, NewTag } from '$lib/logic/tag';

export const getTags = async (): Promise<Tag[]> => {
	const res = await fetch('/tags');
	if (!res.ok) return [];
	const data = await res.json();
	return data.tags;
};

export const createTag = async (input: NewTag): Promise<Tag | null> => {
	const res = await fetch('/tags', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input)
	});
	if (!res.ok) return null;
	const data = await res.json();
	return data.tag;
};

export const deleteTag = async (id: string): Promise<boolean> => {
	const res = await fetch(`/tags/${id}`, {
		method: 'DELETE'
	});
	return res.ok;
};

export const addTagToMedia = async (tagId: string, hashes: string[]): Promise<boolean> => {
	const res = await fetch('/media/tags', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ tagId, hashes })
	});
	return res.ok;
};

export const removeTagFromMedia = async (tagId: string, hashes: string[]): Promise<boolean> => {
	const res = await fetch('/media/tags', {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ tagId, hashes })
	});
	return res.ok;
};
