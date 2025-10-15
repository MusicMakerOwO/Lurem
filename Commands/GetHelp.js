const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	aliases: ['get-help'],
	data: new SlashCommandBuilder()
		.setName('get-help')
		.setDescription('Get help with using the bot'),
	async execute(interaction, client) {
		const getHelp = client.buttons.get('get-help');
		return getHelp.execute(interaction, client, [
			'1385212054041923601', // head admin
			'1389787464813514774', // moderator
			'1427890838373007462' // helper
		]);
	}
}