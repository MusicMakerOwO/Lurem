module.exports = {
	customID: 'setup-help-channel-tag',
	async execute(interaction, client, args) {
		const selectedChannelId = args[0];
		const channel = interaction.guild.channels.cache.get(selectedChannelId);

		await interaction.deferUpdate();

		if (!interaction.member.permissions.has('ManageGuild')) {
			return interaction.editReply({
				embeds: [{
					color: 0xff0000,
					description: 'You need the "Manage Server" permission to use this button'
				}]
			});
		}

		const availableTags = channel.availableTags; // { id, name, moderated, emoji: { id, name } | null }[]
		if (availableTags.length === 0) {
			return interaction.editReply({
				embeds: [{
					color: 0xff0000,
					description: 'The selected channel has no available tags. Please create some tags in the channel settings first.'
				}]
			});
		}

		const selectMenu = {
			type: 1,
			components: [
				{
					type: 3,
					custom_id: `setup-help-channel-finalize_${selectedChannelId}`,
					options: availableTags.map(t => {
						const emoji = ResolveEmoji(interaction.guild, t.emoji);
						return {
							label: t.name,
							value: t.id,
							emoji: emoji ?? undefined
						}
					})
				}
			]
		}

		return interaction.editReply({
			embeds: [{
				color: 0xffff00,
				title: 'Select Solved Tag',
				description: 'Please select a tag from the dropdown menu below. This tag will be automatically added to posts when they are marked as solved.'
			}],
			components: [selectMenu]
		});
	}
}

function ResolveEmoji(guild, emoji) {
	if (!emoji) return null;
	if (emoji.name) return { name: emoji.name };
	if (emoji.id) {
		const e = guild.emojis.cache.get(emoji.id);
		return e ? { id: e.id, name: e.name, animated: e.animated } : null;
	}
	return null;
}