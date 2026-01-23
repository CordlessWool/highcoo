import { getContext, setContext, tick } from 'svelte';

const UPLOAD_CONTEXT_KEY = Symbol('upload-progress');

export type UploadContext = {
	total: number;
	completed: number;
	errors: number;
	start: (count: number) => void;
	complete: () => void;
	fail: () => void;
	retry: () => void;
	dismissError: () => void;
};

export const initUploadContext = (): UploadContext => {
	let total = $state(0);
	let completed = $state(0);
	let errors = $state(0);

	const tryReset = async () => {
		if (completed >= total && errors === 0) {
			await tick();
			if (completed >= total && errors === 0) {
				total = 0;
				completed = 0;
				errors = 0;
			}
		}
	};

	const ctx: UploadContext = {
		get total() {
			return total;
		},
		get completed() {
			return completed;
		},
		get errors() {
			return errors;
		},
		start: (count: number) => {
			total += count;
		},
		complete: () => {
			completed++;
			tryReset();
		},
		fail: () => {
			completed++;
			errors++;
		},
		retry: () => {
			completed--;
			errors--;
		},
		dismissError: () => {
			errors--;
			tryReset();
		}
	};

	setContext(UPLOAD_CONTEXT_KEY, ctx);
	return ctx;
};

export const getUploadContext = (): UploadContext => {
	return getContext<UploadContext>(UPLOAD_CONTEXT_KEY);
};

export const hasUploadContext = (): boolean => {
	return getContext<UploadContext | undefined>(UPLOAD_CONTEXT_KEY) !== undefined;
};
