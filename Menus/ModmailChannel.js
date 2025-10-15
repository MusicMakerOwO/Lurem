const Database = require('../Utils/Database');

module.exports = {
	customID: 'setup-modmail',
	async execute(interaction, client, args) {
		const channelID = interaction.values[0];

		Database.prepare("UPDATE GuildSettings SET modmail_channel_id = ? WHERE guild_id = ?").run(channelID, interaction.guild.id);

		return interaction.update({
			embeds: [{
				color: 0xffff00,
				title: 'Modmail Channel Set',
				description: `Modmail channel has been set to <#${channelID}>\nYou can now use modmail in this server!`
			}],
			components: []
		});
	}
}