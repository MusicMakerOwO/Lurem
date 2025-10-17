const { SlashCommandBuilder } = require('discord.js');
const { STAFF_ROLES } = require('../Utils/Constants.js');

module.exports = {
	aliases: ['get-help'],
	data: new SlashCommandBuilder()
		.setName('get-help')
		.setDescription('Get help with using the bot'),
	async execute(interaction, client) {
		const getHelp = client.buttons.get('get-help');
		return getHelp.execute(interaction, client, STAFF_ROLES);
	}
}