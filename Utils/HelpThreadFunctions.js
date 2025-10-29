const Database = require("./Database");
const TaskScheduler = require("./TaskScheduler");
const { helpThreadTaskID } = require("./Constants");

// runs after 12 hours
async function WarnInactivityHelpThread(thread) {
	await thread.send({
		embeds: [{
			color: 0xffff00,
			description: `
**This thread has been inactive for 12 hours**
Please respond if you still need help, or the thread will be closed.

If your problem is solved, please use \`/solve\` to close this post!`
		}]
	});

	const taskID = helpThreadTaskID.get(thread.id);

	// There is a possible race condition in here
	// There is a TINY window after cancelling the previous task and saving the new task ID
	// I estimate this is window is less than 1ms however, so I'm not too worried

	TaskScheduler.cancel(taskID);

	// duplicates memory unfortunately but no choice here really
	const callback = CloseThread.bind(null, thread);

	const newTaskID = TaskScheduler.schedule(callback, 12 * 60 * 60 * 1000, null); // null disables restarts
	helpThreadTaskID.set(thread.id, newTaskID);
}

// runs after 24 hours, scheduled by above function
async function CloseThread(thread) {
	Database.prepare("DELETE FROM ActiveHelpChannels WHERE channel_id = ?").run(thread.id);

	const solvedTagID = Database.prepare("SELECT solved_tag_id FROM GuildSettings WHERE guild_id = ?").pluck().get(thread.guildId);

	// set the tag to solved
	await thread.setAppliedTags([solvedTagID]);

	await thread.send({
		embeds: [{
			color: 0xffff00,
			description: `
**This thread has been marked as solved**

This post will be closed shortly ...
Still need help? Open a new post!`
		}]
	});

	// wait 10 seconds before closing the thread
	setTimeout(async () => {
		await thread.setLocked(true, 'Marked as solved');
		await thread.setArchived(true, 'Marked as solved');
	}, 10_000);
}