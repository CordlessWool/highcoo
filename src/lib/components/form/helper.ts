export enum SaveStatus {
	Idle = 'idle',
	Saving = 'saving',
	Saved = 'saved',
	Error = 'error'
}

export function getErrorMessage(e: unknown): string {
	if (e instanceof Error) return e.message;
	if (e != null && typeof e === 'object' && 'body' in e) {
		const body = (e as { body: unknown }).body;
		if (body != null && typeof body === 'object' && 'message' in body) {
			return String((body as { message: unknown }).message);
		}
	}
	return 'Failed to save';
}

export function debounce<T extends (...args: Parameters<T>) => void>(
	fn: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout>;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => fn(...args), delay);
	};
}
