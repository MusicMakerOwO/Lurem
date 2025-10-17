const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('solve')
		.setDescription('Mark the thread as solved'),
	async execute(interaction, client) {
		const button = client.buttons.get('solve');
		return button.execute(interaction, client, []);
	}
}