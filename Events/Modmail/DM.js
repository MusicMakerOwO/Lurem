const Database = require('../../Utils/Database.js');

module.exports = {
	name: 'messageCreate',
	execute: async function (client, message) {
		if (message.author.bot) return;
		if (message.guild !== null) return;

		const attachmentUrls = Array.from(message.attachments.values()).map(a => a.url);
		const content = message.content + (attachmentUrls.length > 0 ? `\n\n${attachmentUrls.join('\n')}` : '');

		const messageEmbed = {
			color: 0xffff00,
			author: {
				name: `${message.author.tag} (${message.author.id})`,
				icon_url: message.author.displayAvatarURL({ dynamic: true })
			},
			description: content || '[ Something went wrong! ]',
		};

		const ActiveModmail = Database.prepare("SELECT channel_id FROM Modmail WHERE user_id = ?").get(message.author.id);
		if (ActiveModmail) {
			const ModmailChannel = client.channels.cache.get(ActiveModmail.channel_id);
			if (!ModmailChannel) throw new Error(`Modmail channel not found for user ID ${message.author.id}`);

			try {
				await ModmailChannel.send({ embeds: [messageEmbed] });
				message.react('✅');
			} catch (error) {
				console.log(error);
				message.react('❌').catch(() => {});
			}

			return;
		}

		const GuildSettings = Database.prepare("SELECT modmail_channel_id FROM GuildSettings WHERE guild_id = ?").get(client.config.GUILD_ID);
		if (!GuildSettings || !GuildSettings.modmail_channel_id) return;

		const ModmailChannel = client.channels.cache.get(GuildSettings.modmail_channel_id);
		if (!ModmailChannel) throw new Error('Modmail channel not found in guild settings');

		try {
			const thread = await ModmailChannel.threads.create({
				name: `Modmail - ${message.author.username}`,
				reason: `Modmail created for ${message.author.tag} (${message.author.id})`,
				autoArchiveDuration: 10080, // 7 days
				type: 11 // public (all staff can read it)
			});
			Database.prepare("INSERT INTO Modmail (user_id, channel_id) VALUES (?, ?)").run(message.author.id, thread.id);

			await message.author.send({
				embeds: [{
					color: 0xffff00,
					title: 'Modmail Created',
					description: `
A new modmail has been created for you.
The staff ping have just been pinged and will be with you shortly.

While you wait, **please describe your issue in detail.**`,
				}]
			});
			await thread.send({
				content: `**New Modmail** • <@${message.author.id}>`,
				embeds: [{
					color: 0xffff00,
					title: 'New Modmail',
					description: `
A new modmail has been created for <@${message.author.id}>.
Please assist them as soon as possible.

While you wait for a staff member to respond, **please describe your issue in detail.**`,
				}]
			});

			await thread.send({ embeds: [messageEmbed] });
			message.react('✅');
		} catch (error) {
			console.log(error);
			message.react('❌').catch(() => {});
		}
	}
}