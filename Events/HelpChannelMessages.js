const Database = require('../Utils/Database.js');
const { helpChannelTaskID } = require('../Utils/Constants.js');

module.exports = {
	name: 'messageCreate',
	execute: async function (client, message) {
		if (message.author.bot) return;
		if (message.guild !== null) return;

		// if no channel, nothing happens
		Database.prepare("UPDATE ActiveHelpChannels SET last_message_timestamp = ? WHERE channel_id = ?").run(Date.now(), message.channel.id);
	}
}