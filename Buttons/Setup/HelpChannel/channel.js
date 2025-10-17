module.exports = {
	customID: 'setup-help-channel',
	async execute(interaction, client, args) {
		if (!interaction.replied && !interaction.deferred) {
			await interaction.deferUpdate({ ephemeral: true });
		}

		if (!interaction.member.permissions.has('ManageGuild')) {
			return interaction.editReply({
				embeds: [{
					color: 0xff0000,
					description: 'You need the "Manage Server" permission to use this button'
				}]
			});
		}

		const channelList = Array.from(interaction.guild.channels.cache.values())

		const forumChannels = channelList.filter(c => c.type === 15);

		if (forumChannels.length === 0) {
			return interaction.editReply({
				embeds: [{
					color: 0xff0000,
					description: 'This server has no forum channels - Please create one first'
				}]
			});
		}

		const selectMenu = {
			type: 1,
			components: [
				{
					type: 3,
					custom_id: 'setup-help-channel-select',
					options: forumChannels.map(c => ({
						label: '#' + c.name,
						value: c.id,
						description: `ID: ${c.id}`
					}))
				}
			]
		}

		return interaction.editReply({
			embeds: [{
				color: 0xffff00,
				title: 'Select Help Channel',
				description: 'Please select a forum channel from the dropdown menu below.\nThis is where users can post their questions and get assistance from the community.'
			}],
			components: [selectMenu]
		});
	}
}