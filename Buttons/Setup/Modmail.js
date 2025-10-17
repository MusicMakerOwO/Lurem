module.exports = {
	customID: 'setup-modmail',
	execute: async function (interaction, client, args) {
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

		const textChannels = channelList.filter(c => c.type === 0).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

		const selectMenu = {
			type: 1,
			components: [
				{
					type: 3,
					custom_id: 'setup-modmail',
					options: textChannels.map(c => ({
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
				title: 'Select Modmail',
				description: 'Please select a channel to use for modmails.\nA new thread will be created for each modmail that is create.'
			}],
			components: [selectMenu]
		});
	}
}