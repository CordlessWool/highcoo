export type JobResult<T, R> =
	| { ok: true; item: T; value: R }
	| { ok: false; item: T; error: Error };

export class BatchProcessor<T, R = void> {
	private queue: T[] = [];
	private activeWorkers = 0;
	private maxConcurrent: number;
	private processFn: (item: T) => Promise<R>;
	private subscribers = new Set<(result: JobResult<T, R>) => void>();

	constructor(processFn: (item: T) => Promise<R>, maxConcurrent = 3) {
		this.processFn = processFn;
		this.maxConcurrent = maxConcurrent;
	}

	subscribe(fn: (result: JobResult<T, R>) => void): () => void {
		this.subscribers.add(fn);
		return () => this.subscribers.delete(fn);
	}

	add(item: T) {
		this.queue.push(item);
		this.process();
	}

	private notify(result: JobResult<T, R>) {
		this.subscribers.forEach((fn) => fn(result));
	}

	private process() {
		if (this.queue.length === 0 || this.activeWorkers >= this.maxConcurrent) return;

		const item = this.queue.shift()!;
		this.activeWorkers++;

		this.processFn(item)
			.then((value) => {
				this.notify({ ok: true, item, value });
			})
			.catch((error) => {
				this.notify({ ok: false, item, error });
			})
			.finally(() => {
				this.activeWorkers--;
				this.process();
			});
	}
}
