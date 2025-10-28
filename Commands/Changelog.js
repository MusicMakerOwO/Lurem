const { SlashCommandBuilder } = require('@discordjs/builders');

const CHANGELOG = {
	"v0.1.0": {
		date: "2025 October 12th",
		changes: [
			"Added this changelog command"
		]
	}
}

const OLDEST_VERSION = Object.keys(CHANGELOG).sort((a, b) => a.localeCompare(b))[0];
const LATEST_VERSION = Object.keys(CHANGELOG).sort((a, b) => b.localeCompare(a))[0];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('changelog')
		.setDescription('New here? Check out what has changed!')
		.addStringOption(x => x
			.setName('version')
			.setDescription('The version you want to check')
			.setRequired(false)
			.addChoices([
				{ name: 'Latest', value: 'latest' },
				{ name: 'All', value: 'all' },
				... Object.entries(CHANGELOG).sort((a, b) => b[0].localeCompare(a[0])).map(([version, data]) => ({ name: version, value: version })),
			])
		),
	execute: async function(interaction, client) {
		const input = interaction.options.getString('version') || 'latest';

		if (input === 'all') {
			// show all versions
			const embed = {
				color: 0xffff00,
				title: `Fox Box Insurance : Historical Changelogs`,
				description: ''
			}

			for (const [version, data] of Object.entries(CHANGELOG).sort((a, b) => b[0].localeCompare(a[0]))) {
				embed.description += `**${version}** - \`${data.date}\`\n`;
				embed.description += `${data.changes.map(x => `\\- ${x}`).join('\n')}\n\n`;
			}

			return interaction.reply({
				embeds: [embed]
			});
		}

		const version = input === 'latest' ? LATEST_VERSION : input;

		const data = CHANGELOG[version];
		if (!data) {
			console.error(`Changelog for version "${input}" not found`);
			return interaction.reply({
				content: `No changelog found for version \`${input}\``,
				ephemeral: true
			});
		}

		const embed = {
			color: 0xffff00,
			title: `Lurem : ${version}`,
			description: `
Updated: \`${data.date}\`

${data.changes.map(x => `\\- ${x}`).join('\n')}

Made by @musicmaker 💙`
		};

		return interaction.reply({
			embeds: [embed]
		});
	}
}