const Database = require('../Utils/Database');

module.exports = {
	customID: 'setup-help-channel-finalize',
	async execute(interaction, client, args) {
		const selectedTagId = interaction.values[0];
		const channelId = args[0];

		Database.prepare("UPDATE GuildSettings SET help_channel_id = ?, solved_tag_id = ? WHERE guild_id = ?").run(channelId, selectedTagId, interaction.guild.id);

		return interaction.update({
			embeds: [{
				color: 0xffff00,
				title: 'Setup Complete',
				description: `The help channel has been completed successfully!`
			}],
			components: []
		});
	}
}