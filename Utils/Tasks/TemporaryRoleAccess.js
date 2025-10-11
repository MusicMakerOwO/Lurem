const Database = require('../Database');
const Log = require('../Logs');
const client = require('../../client');

const TemporaryRoles = Database.prepare("SELECT * FROM TemporaryRoles WHERE expires_at <= ?");
const DeleteTemporaryRole = Database.prepare("DELETE FROM TemporaryRoles WHERE guild_id = ? AND user_id = ? AND role_id = ?");

module.exports = async function TemporaryRoleAccess() {
	const now = Date.now();
	const expiredRoles = TemporaryRoles.all(now);
	if (expiredRoles.length === 0) return;

	for (const entry of expiredRoles) {
		const guild = client.guilds.cache.get(entry.guild_id);
		const member = guild.members.cache.get(entry.user_id) ?? await guild.members.fetch(entry.user_id).catch(() => null);
		if (member === null) {
			DeleteTemporaryRole.run(entry.guild_id, entry.user_id, entry.role_id);
			continue;
		}

		try {
			await member.roles.remove(entry.role_id, 'Temporary role expired');
		} catch (err) {
			Log.error(err);
		}
	}
}