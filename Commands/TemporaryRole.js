const Database = require('../Utils/Database');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('temp-role')
		.setDescription('Assign a temporary role to a user')
		.addUserOption(x => x
			.setName('user')
			.setDescription('The user to assign the role to')
			.setRequired(true)
		)
		.addRoleOption(x => x
			.setName('role')
			.setDescription('The role to assign temporarily')
			.setRequired(true)
		)
		.addStringOption(x => x
			.setName('duration')
			.setDescription('Duration for the role (e.g., 10m, 2h, 1d)')
			.setRequired(true)
		),
	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const role = interaction.options.getRole('role');
		const durationStr = interaction.options.getString('duration');

		if (role.id === interaction.guild.id) {
			return interaction.reply({
				embeds: [{
					color: 0xff0000,
					description: 'Nice try buddy'
				}]
			});
		}

		await interaction.deferReply();

		const member = await interaction.guild.members.fetch(user.id).catch(() => null);
		if (!member) {
			return interaction.editReply({
				embeds: [{
					color: 0xff0000,
					description: 'User not found in this server'
				}]
			})
		}

		if (!(durationStr[0] >= '0' && durationStr[0] <= '9')) {
			return interaction.editReply({
				embeds: [{
					color: 0xff0000,
					description: 'Invalid duration format - Must be a valid time string (e.g., 2h 30m)'
				}]
			})
		}

		const tokens = [];
		let buffer = '';
		let charType = null; // 1 = digit, 2 = letter

		for (let i = 0; i < durationStr.length; i++) {
			const char = durationStr[i];
			if (char === ' ') continue;

			// Check if char is a digit
			if (char >= '0' && char <= '9') {
				if (charType !== 1) {
					if (buffer.length > 0) tokens.push(buffer);
					buffer = char;
					charType = 1;
				} else {
					buffer += char;
				}
				continue;
			}

			// Check if char is a letter
			if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')) {
				if (charType !== 2) {
					if (buffer.length > 0) tokens.push(buffer);
					buffer = char;
					charType = 2;
				} else {
					buffer += char;
				}
				continue;
			}

			// and ignore anything else lol
		}

		if (buffer.length > 0) tokens.push(buffer);

		if (tokens.length % 2 !== 0) {
			return interaction.editReply({
				embeds: [{
					color: 0xff0000,
					description: 'Invalid duration format - Must be a valid time string (e.g., 2h 30m)'
				}]
			})
		}

		let totalDuration = 0;
		for (let i = 0; i < tokens.length; i += 2) {
			const numStr = tokens[i];
			const unitStr = tokens[i + 1].toLowerCase();

			const num = parseInt(numStr);
			if (isNaN(num) || num <= 0) {
				return interaction.editReply({
					embeds: [{
						color: 0xff0000,
						description: `Invalid number in duration: "${numStr}"`
					}]
				})
			}

			let multiplier = 1;
			switch (unitStr.toLowerCase()) {
				case 'd':
				case 'day':
				case 'days':
					multiplier *= 24;
				case 'h':
				case 'hr':
				case 'hrs':
				case 'hour':
				case 'hours':
					multiplier *= 60;
				case 'm':
				case 'min':
				case 'mins':
				case 'minute':
				case 'minutes':
					multiplier *= 60;
				case 's':
				case 'sec':
				case 'secs':
				case 'second':
				case 'seconds':
					multiplier *= 1000;
					break;
				default:
					return interaction.editReply({
						embeds: [{
							color: 0xff0000,
							description: `Invalid time unit in duration: "${unitStr}", must be one of d, h, m, s`
						}]
					})
			}

			totalDuration += num * multiplier;
		}

		if (totalDuration < 5000) {
			return interaction.editReply({
				embeds: [{
					color: 0xff0000,
					description: 'Duration must be at least 5 seconds'
				}]
			})
		}
		if (totalDuration > 1000 * 60 * 60 * 24 * 365) { // 1 year
			return interaction.editReply({
				embeds: [{
					color: 0xff0000,
					description: 'Duration cannot exceed 1 year'
				}]
			})
		}

		if (role.managed) {
			return interaction.editReply({
				embeds: [{
					color: 0xff0000,
					description: 'Cannot give a bot\'s role'
				}]
			})
		}

		if (interaction.member.roles.highest.position <= role.position && interaction.guild.ownerId !== interaction.user.id) {
			return interaction.editReply({
				embeds: [{
					color: 0xff0000,
					description: 'You cannot give a role higher/equal to your highest role'
				}]
			})
		}

		if (interaction.guild.members.me.roles.highest.position <= role.position) {
			return interaction.editReply({
				embeds: [{
					color: 0xff0000,
					description: 'That role is above my own, I cannot assign it'
				}]
			})
		}

		if (!interaction.member.permissions.has('ManageRoles')) {
			return interaction.editReply({
				embeds: [{
					color: 0xff0000,
					description: 'You need the Manage Roles permission to use this command'
				}]
			})
		}

		Database.prepare(`
			INSERT OR REPLACE INTO TemporaryRoles (guild_id, user_id, role_id, expires_at)
			VALUES (?, ?, ?, ?)
		`).run(
			interaction.guild.id,
			user.id,
			role.id,
			Date.now() + totalDuration
		);

		await member.roles.add(role, `Temporary role assigned by @${interaction.user.username} for ${durationStr}`);

		return interaction.editReply({
			embeds: [{
				color: 0x00ff00,
				title: '✅ Temporary Role Assigned',
				description: `
**User:** <@${user.id}>
**Role:** <@&${role.id}>
**Duration:** \`${durationStr}\`
-# Role will be automatically removed when the time expires.`
			}]
		});
	}
}