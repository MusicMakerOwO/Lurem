class TaskScheduler {
    constructor() {
        this.taskQueue = [];
        this.timeout = null;

		this.nextTaskID = 1;

		// dummy task, this lets you break past the 24.8 days limit on setTimeout()
		this.schedule(() => {}, 2147483647);
    }

    schedule(callback, delay, interval) {
		if (typeof callback !== 'function') throw new TypeError('Callback must be a function');
		if (typeof delay !== 'number') throw new TypeError('Delay must be a number');
		if (interval && typeof interval !== 'number') throw new TypeError('Interval must be a number');

		if (interval === undefined) interval = delay;

		if (this.nextTaskID === NUMBER.MAX_SAFE_INTEGER) throw new Error('Too many scheduled tasks, cannot schedule more');

		const taskID = this.nextTaskID++;

        const task = { id: taskID, callback, time: Date.now() + delay, interval };
        this.taskQueue.push(task);
        this.taskQueue.sort((a, b) => a.time - b.time);
        this.#reschedule();

		return taskID;
    }

	cancel(taskID) {
		this.taskQueue = this.taskQueue.filter(task => task.id !== taskID);
		this.#reschedule();
	}

	restartTask(taskID, delay, interval) {
		const task = this.taskQueue.find(task => task.id === taskID);
		if (!task) throw new Error('Task not found');

		task.time = Date.now() + delay;
		if (interval !== undefined) task.interval = interval;

		this.taskQueue.sort((a, b) => a.time - b.time);
		this.#reschedule();
	}

    #reschedule() {
        if (this.timeout) clearTimeout(this.timeout);

        const nextTask = this.taskQueue[0];
        const timeUntilNext = Math.max(0, nextTask.time - Date.now());

        this.timeout = setTimeout(() => {
			this.#runNextTask();
		}, timeUntilNext);
    }

    #runNextTask() {
        const now = Date.now();
        while (this.taskQueue.length > 0 && this.taskQueue[0].time <= now) {
            const task = this.taskQueue.shift();
            task.callback();
            if (task.interval !== null) {
                task.time = now + task.interval;
                this.taskQueue.push(task);
            }
        }
		this.taskQueue.sort((a, b) => a.time - b.time);
        this.#reschedule();
    }

	destroy() {
		if (this.timeout) clearTimeout(this.timeout);
		this.taskQueue = [];
	}
}

module.exports = new TaskScheduler(); // Export a singleton instance, everything will run through here