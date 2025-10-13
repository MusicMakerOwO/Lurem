const Database = require("../Utils/Database.js");

const InsertStatement = Database.prepare("INSERT INTO GuildSettings (guild_id) VALUES (?) ON CONFLICT (guild_id) DO NOTHING");

module.exports = {
	name: 'guildCreate',
	execute: async function (client, guild) {
		InsertStatement.run(guild.id);
	}
}