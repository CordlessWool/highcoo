export class BatchProcessor<T> {
	private queue: T[] = [];
	private activeWorkers = 0;
	private maxConcurrent: number;
	private processFn: (item: T) => Promise<void>;

	constructor(processFn: (item: T) => Promise<void>, maxConcurrent = 3) {
		this.processFn = processFn;
		this.maxConcurrent = maxConcurrent;
	}

	add(item: T) {
		this.queue.push(item);
		this.process();
	}

	private process() {
		if (this.queue.length === 0 || this.activeWorkers >= this.maxConcurrent) return;

		const item = this.queue.shift()!;
		this.activeWorkers++;

		this.processFn(item).finally(() => {
			this.activeWorkers--;
			this.process();
		});
	}
}
