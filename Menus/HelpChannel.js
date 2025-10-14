module.exports = {
	customID: 'setup-help-channel-select',
	async execute(interaction, client, args) {
		const selectedChannelId = interaction.values[0];
		const channel = interaction.guild.channels.cache.get(selectedChannelId);

		if (!channel || channel.type !== 15) {
			return interaction.update({
				embeds: [{
					color: 0xff0000,
					description: 'The selected channel is not a valid forum channel. Please try again.'
				}]
			});
		}

		if (!interaction.member.permissions.has('ManageGuild')) {
			return interaction.update({
				embeds: [{
					color: 0xff0000,
					description: 'You need the "Manage Server" permission to use this button'
				}]
			});
		}

		const tagButton = client.buttons.get('setup-help-channel-tag');
		return tagButton.execute(interaction, client, [selectedChannelId]);
	}
}