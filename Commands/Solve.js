const { SlashCommandBuilder } = require('discord.js');
const Database = require('../Utils/Database.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('solve')
		.setDescription('Mark the thread as solved'),
	async execute(interaction) {
		const ChannelSettings = Database.prepare("SELECT help_channel_id, solved_tag_id FROM GuildSettings WHERE guild_id = ?").get(interaction.guild.id);
		if (!ChannelSettings || !ChannelSettings.help_channel_id || !ChannelSettings.solved_tag_id) {
			return interaction.reply({
				embeds: [{
					color: 0xff0000,
					description: 'This server has not set up a help channel yet. Please run `/setup help-channel` to start the process.'
				}],
				ephemeral: true
			});
		}

		await interaction.deferReply();

		// set the tag to solved
		await interaction.channel.setAppliedTags([ChannelSettings.solved_tag_id]);

		await interaction.editReply({
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
			await interaction.channel.setArchived(true, 'Marked as solved');
			await interaction.channel.setLocked(true, 'Marked as solved');
		}, 10_000);
	}
}