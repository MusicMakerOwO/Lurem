const { SECONDS } = require("../Constants");
const Database = require("../Database");
const Log = require("../Logs");
const TaskScheduler = require("../TaskScheduler");

const TIME_BETWEEN_TASKS = SECONDS.MINUTE * 10; // 10 minutes

const TASKS = [
	[ 'temp_role_access',	require("./TemporaryRoleAccess.js"), 5 ], // run every 5 seconds
];

for (let i = 0; i < TASKS.length; i++) {
	TASKS[i][2] *= 1000; // convert interval to milliseconds
}

const longestName = Math.max( ... TASKS.map(t => t[0].length) );

module.exports.StartTasks = async function StartTasks() {
	const totalTasks = TASKS.length;
	if (totalTasks === 0) {
		Log.warn("No tasks to manage - nothing to do!");
		return;
	} else {
		Log.success(`Starting ${totalTasks} automatic tasks...`);
	}

	const selectQuery = Database.prepare("SELECT last_run FROM Timers WHERE id = ?");

	for (let i = 0; i < TASKS.length; i++) {
		const taskData = TASKS[i];
		if (!Array.isArray(taskData) || taskData.length !== 3) {
			Log.warn(`Task entry ${i} is not an array, skipping...`);
			continue;
		}
		const [ name, callback, interval ] = taskData;

		if (typeof interval !== 'number' || interval <= 0 || !Number.isFinite(interval)) {
			Log.warn(`Task "${name}" does not have a defined interval, skipping...`);
			continue;
		}
		if (typeof callback !== 'function') {
			Log.warn(`Task "${name}" does not have a callback function, skipping...`);
			continue;
		}
		if (callback.constructor.name !== 'AsyncFunction') {
			Log.warn(`Task "${name}" callback must be an async function, skipping...`);
			continue;
		}

		const lastRun = selectQuery.pluck().get(name);
		// rounding errors shouldn't be a concern because the exact second doesn't matter
		const lastRunNumber = Number(lastRun) || -1;

		const now = Date.now();
		const timeSinceLastRun = Math.max(0, now - lastRunNumber);

		const offset = (TIME_BETWEEN_TASKS * 1000) * i;
		const delay = Math.max(timeSinceLastRun >= interval ? 0 : interval - timeSinceLastRun, offset);

		TaskScheduler.schedule(() => {
			try {
				callback();
				Database.prepare("INSERT INTO Timers (id, last_run) VALUES (?, ?) ON CONFLICT DO UPDATE SET last_run = excluded.last_run").run(name, Date.now());
			} catch (err) {
				Log.error(err);
			}
		}, delay, interval);

		Log.success(`[TASKS] - "${name}"${' '.repeat(longestName - name.length + 2)} : delayed ${(delay / 1000 / 60).toFixed(2)} minutes`);
	}
}