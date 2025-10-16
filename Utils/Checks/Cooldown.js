module.exports = function CheckCooldown(client, guildID, userID, interactionType, command, cooldown) {
	const timeRemaining = client.cooldowns.get(`${guildID}-${userID}-${interactionType}-${command}`) || 0;
	const remaining = (timeRemaining - Date.now()) / 1000;
	if (remaining > 0) {
		throw [`Please wait ${remaining.toFixed(1)} more seconds before reusing the \`${command}\` command!`, 'On cooldown'];
	}
	client.cooldowns.set(`${userID}-${command}`, Date.now() + cooldown * 1000);
};