const { Client } = require('discord.js');

module.exports = new Client({
	intents: [
		'Guilds',
		'GuildMembers',
		'GuildMessages',
		'MessageContent',
		'DirectMessages',
		'GuildPresences'
	],
	// DJS doesn't take string inputs like intents
	// This is partials for channels and messages, required for DMs
	partials: [ 1, 3 ]
});