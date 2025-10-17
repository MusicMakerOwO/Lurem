const { SlashCommandBuilder } = require('discord.js');
const UserCanManageThread = require('../Utils/CanUserManageThread.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('solve')
		.setDescription('Mark the thread as solved'),
	async execute(interaction) {
		const canManage = UserCanManageThread(
			interaction.user.id,
			interaction.channel.ownerId,
			interaction.channel.parentId,
			Array.from(interaction.member.roles.cache.keys())
		);
		if (typeof canManage === 'string') {
			return interaction.reply({
				embeds: [{
					color: 0xff0000,
					description: canManage
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