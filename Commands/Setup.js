const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Set up various features on the server')
		.addSubcommand(x => x
			.setName('help-channel')
			.setDescription('Set up a help channel')
		)
		.addSubcommand(x => x
			.setName('modmail')
			.setDescription('Set up modmail')
		),
	async execute(interaction, client) {
		if (!interaction.member.permissions.has('ManageGuild')) {
			return interaction.editReply({
				embeds: [{
					color: 0xff0000,
					description: 'You need the "Manage Server" permission to use this command'
				}]
			});
		}

		await interaction.deferReply({ ephemeral: true });

		switch (interaction.options.getSubcommand()) {
			case 'help-channel': {
				const button = client.buttons.get('setup-help-channel');
				return button.execute(interaction, client, []);
			}
			case 'modmail': {
				const button = client.buttons.get('setup-modmail');
				return button.execute(interaction, client, []);
			}
			default: {
				return interaction.editReply({
					embeds: [{
						color: 0xff0000,
						description: 'Unsupported setup option - This has likely not been implemented yet'
					}]
				});
			}
		}
	}
}