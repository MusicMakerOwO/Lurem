module.exports = function SecondsToTime(seconds) {
	const hrs = Math.floor(seconds / 3600);
	const mins = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;
	return [
		hrs > 0 ? `${hrs} hour${hrs !== 1 ? 's' : ''}` : null,
		mins > 0 ? `${mins} minute${mins !== 1 ? 's' : ''}` : null,
		secs > 0 ? `${secs} second${secs !== 1 ? 's' : ''}` : null
	].filter(Boolean).join(', ');
}