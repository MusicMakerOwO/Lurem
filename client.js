const { Client } = require('discord.js');

moddule.exports = new Client({
	intents: [
		'Guilds',
		'GuildMembers',
		'MessageContent',
		'DirectMessages'
	]
});