const Database = require('../Utils/Database');

module.exports = {
	cooldown: 600, // 10 minutes
	customID: 'get-help',
	async execute(interaction, client, roleIDs = []) {
		if (roleIDs.length === 0) throw new Error('No help roles provided');

		const HelpChannelID = Database.prepare("SELECT help_channel_id FROM GuildSettings WHERE guild_id = ?").pluck().get(interaction.guild.id);
		if (!HelpChannelID) {
			return interaction.reply({
				embeds: [{
					color: 0xff0000,
					description: 'The help channel has not been set up yet. Please use `/setup help-channel` to start the process.'
				}],
				ephemeral: true
			});
		}

		if (interaction.channel.id !== HelpChannelID && interaction.channel.parentId !== HelpChannelID) {
			return interaction.reply({
				embeds: [{
					color: 0xff0000,
					description: `You can only use this in <#${HelpChannelID}>`
				}],
				ephemeral: true
			});
		}

		// there's no fetching below - just cache and filter - but I don't trust it to be instant
		await interaction.deferReply().catch( () => {} );

		const availableUsers = new Set();
		for (const roleID of roleIDs) {
			const role = interaction.guild.roles.cache.get(roleID);
			if (!role) continue;

			const membersWithRole = role.members;

			for (const member of membersWithRole.values()) {
				const presence = interaction.guild.presences.cache.get(member.id) ?? { status: 'offline' };
				if (presence.status === 'offline' || presence.status === 'dnd') continue;
				availableUsers.add(member.user.id);
			}
		}

		// select up to 5 users at random
		const usersToPing = new Array(Math.min(5, availableUsers.size));
		const availableUsersArray = Array.from(availableUsers);
		for (let i = 0; i < usersToPing.length; i++) {
			const randomIndex = Math.floor(Math.random() * availableUsersArray.length);
			usersToPing[i] = availableUsersArray.splice(randomIndex, 1)[0];
		}

		if (usersToPing.length === 0) {
			return interaction.editReply({
				embeds: [{
					color: 0xffa500,
					description: 'No help staff are currently available. Please try again later or contact the server staff directly.'
				}],
				ephemeral: true
			});
		}

		return interaction.editReply({
			content: `
**Assistance Requested** • <@${interaction.user.id}>
While you wait, please list your issue in detail!
Be patient and we will respond as soon as we can.

**Available Staff**
${usersToPing.map(id => `\\> <@${id}>`).join('\n')}`
		});
	}
}