const Database = require('../../Utils/Database');

module.exports = {
	customID: 'modmail-close',
	async execute(interaction, client) {
		const modmailData = Database.prepare("SELECT user_id, channel_id FROM Modmail WHERE (user_id = ? OR channel_id = ?)").get(interaction.user.id, interaction.channel.id);
		if (!modmailData) {
			return interaction.reply({
				embeds: [{
					color: 0xff0000,
					description: '❌ This channel is not an active modmail thread.'
				}],
				ephemeral: true
			});
		}

		const userClosed = modmailData.user_id === interaction.user.id;

		const staffEmbed = {
			color: 0xff0000,
			description: userClosed ?
				`**The user has closed the modmail thread.**` :
				`**This modmail has been closed** - <@${interaction.user.id}>`
		}

		const userEmbed = {
			color: 0xff0000,
			description: userClosed ?
				`You have closed the modmail thread. If you need further assistance, feel free to open a new thread.` :
				`A staff member has closed the modmail thread. If you need further assistance, feel free to open a new thread.`
		}

		const channel = client.channels.cache.get(modmailData.channel_id);
		if (channel) channel.send({ embeds: [staffEmbed] }).catch(console.log);

		// Notify the user
		const user = await client.users.fetch(modmailData.user_id);
		if (user) user.send({ embeds: [userEmbed] }).catch(console.log);

		const timeoutEmbed = {
			color: 0xffa500,
			description: `**This modmail thread will be closed in 10 seconds ...**`
		}

		if (channel) channel.send({ embeds: [timeoutEmbed] }).catch(console.log);
		if (user) user.send({ embeds: [timeoutEmbed] }).catch(console.log);

		// wait 10 seconds before closing the thread
		setTimeout(async () => {
			Database.prepare("DELETE FROM Modmail WHERE user_id = ? AND channel_id = ?").run(modmailData.user_id, modmailData.channel_id);
			if (channel) {
				await channel.setLocked(true, 'Modmail closed');
				await channel.setArchived(true, 'Modmail closed');
			}
			if (user) {
				user.send({
					embeds: [{
						color: 0x00ff00,
						description: '**The modmail thread has been closed successfully.**'
					}]
				}).catch(console.log);
			}
		}, 10_000);
	}
}