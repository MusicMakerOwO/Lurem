-- NodeJS can only make timers so long
-- For long running tasks like channel purging we need a more permanent solution
-- This will keep the run time data even on restart
CREATE TABLE IF NOT EXISTS Timers (
	id TEXT NOT NULL PRIMARY KEY,
	last_run INTEGER NOT NULL DEFAULT ( UNIXEPOCH('now', 'localtime') )
) STRICT;

CREATE TABLE IF NOT EXISTS Modmail (
	channel_id TEXT NOT NULL PRIMARY KEY,
	user_id TEXT NOT NULL UNIQUE,
	created_at INT NOT NULL
) STRICT;

CREATE TABLE ServerSettings (
	guild_id TEXT NOT NULL PRIMARY KEY,
	help_channel_id TEXT NOT NULL
) STRICT;
