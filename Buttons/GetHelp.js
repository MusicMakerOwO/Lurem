const CanUserManageThread = require('../Utils/CanUserManageThread.js');
const { STAFF_ROLES } = require("../Utils/Constants");
const SecondsToTime = require('../Utils/SecondsToTime.js');

const cooldown = new Map(); // userID -> last run timestamp

const COMMANED_COOLDOWN = 1000 * 60 * 10; // 10 minutes

module.exports = {
	customID: 'get-help',
	async execute(interaction, client, roleIDs = []) {
		if (roleIDs.length === 0) roleIDs = STAFF_ROLES;

		const lastRun = cooldown.get(interaction.user.id) || 0;
		const now = Date.now();
		if (now - lastRun < COMMANED_COOLDOWN) {
			const timeLeft = Math.ceil((COMMANED_COOLDOWN - (now - lastRun)) / 1000);
			return interaction.reply({
				embeds: [{
					color: 0xffa500,
					description: `You can only use this button once every 10 minutes. Please wait ${SecondsToTime(timeLeft)} before trying again.`
				}],
				ephemeral: true
			});
		}
		cooldown.set(interaction.user.id, now);

		const canManage = CanUserManageThread(
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