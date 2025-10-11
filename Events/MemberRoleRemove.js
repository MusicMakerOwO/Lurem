const Database = require('../Utils/Database');

function MemberRolesMatch(oldRoles, newRoles) {
	if (oldRoles.length !== newRoles.length) return false;
	for (let i = 0; i < oldRoles.length; i++) {
		if (oldRoles[i] !== newRoles[i]) return false;
	}
	return true;
}

const TempRoleDelete = Database.prepare("DELETE FROM TemporaryRoles WHERE guild_id = ? AND user_id = ? AND role_id = ?");

module.exports = {
	name: 'guildMemberUpdate',
	execute: async function (client, oldMember, newMember) {
		if ( MemberRolesMatch(oldMember._roles, newMember._roles) ) return;

		const removedRoles = oldMember._roles.filter(role => !newMember._roles.includes(role));
		if (removedRoles.length === 0) return;

		for (const roleId of removedRoles) {
			TempRoleDelete.run(newMember.guild.id, newMember.user.id, roleId);
		}
	}
}