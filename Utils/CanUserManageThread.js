const { STAFF_ROLES } = require('./Constants.js');
const Database = require('./Database.js');
const config = require('../config.json');

const StaffRoleSet = new Set(STAFF_ROLES);

const HelpChannelSettings = Database.prepare("SELECT help_channel_id FROM GuildSettings WHERE guild_id = ?");

module.exports = function CanUserManageThread(userID, threadOwnerID, threadParentID, roles = []) {

	const HelpChannelID = HelpChannelSettings.pluck().get(config.GUILD_ID);
	if (!HelpChannelID) return 'The help channel has not been set up yet. Please use `/setup help-channel` to start the process.';

	if (threadParentID !== HelpChannelID) return `You can only use this in <#${HelpChannelID}>`;

	if (userID === threadOwnerID) return true;

	for (const roleID of roles) {
		if (StaffRoleSet.has(roleID)) {
			return true;
		}
	}

	return 'You do not have permission to manage this thread.';
}