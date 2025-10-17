const Database = require('../../Utils/Database');

module.exports = {
	name: 'messageCreate',
	execute: async function (client, message) {
		if (message.author.bot) return;
		if (message.guild === null) return;

		const ActiveModmail = Database.prepare("SELECT user_id FROM Modmail WHERE channel_id = ?").get(message.channelId);
		if (!ActiveModmail) return;

		const StaffRole = message.member.roles.highest.name;
		const User = await client.users.cache.get(ActiveModmail.user_id);

		if (!User) return message.react('❌');

		const attachmentUrls = Array.from(message.attachments.values()).map(a => a.url);
		const content = message.content + (attachmentUrls.length > 0 ? `\n\n${attachmentUrls.join('\n')}` : '');

		try {
			await User.send({
				embeds: [{
					color: 0xffff00,
					author: {
						name: `${message.author.tag} (${message.author.id} - ${StaffRole})`,
						icon_url: message.author.displayAvatarURL({ dynamic: true })
					},
					description: content || '[ Something went wrong! ]',
				}]
			})
			message.react('✅');
		} catch (error) {
			console.log(error);
			message.react('❌').catch(() => {});
		}
	}
}