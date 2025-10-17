const Database = require('../Utils/Database');

module.exports = {
	name: 'channelCreate',
	async execute(channel, client) {
		if (channel.type !== 15) return; // Not a forum channel

		const helpChannelID = Database.prepare("SELECT help_channel_id FROM GuildSettings WHERE guild_id = ?").pluck().get(channel.guild.id);
		if (channel.parentId !== helpChannelID) return; // Not within the help channel

		const buttons = {
			type: 1,
			components: [
				{
					type: 2,
					style: 3,
					label: 'Solved',
					custom_id: 'solve'
				},
				{
					type: 2,
					style: 4,
					label: 'Get Help',
					custom_id: 'get-help'
				}
			]
		}

		await channel.send({
			embeds: [{
				color: 0xffff00,
				title: 'Welcome to the help channel!',
				description: `
Please make sure you describe your issue **thoroughly** and **clearly**. This will allow us to help you faster!`
			}],
			components: [buttons]
		});
	}
}