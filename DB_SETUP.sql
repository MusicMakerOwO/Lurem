-- NodeJS can only make timers so long
-- For long running tasks like channel purging we need a more permanent solution
-- This will keep the run time data even on restart
CREATE TABLE IF NOT EXISTS Timers (
	id TEXT NOT NULL PRIMARY KEY,
	last_run INTEGER NOT NULL DEFAULT ( UNIXEPOCH('now', 'localtime') )
) STRICT;

CREATE TABLE IF NOT EXISTS Modmail (
	channel_id TEXT NOT NULL PRIMARY KEY, -- Thread channel ID, parent channel can be found in GuildSettings.modmail_channel_id
	user_id TEXT NOT NULL UNIQUE,
	created_at INT NOT NULL DEFAULT (UNIXEPOCH('now', 'localtime') * 1000), -- store as ms (JS uses ms timestamps)
    last_message_timestamp INT NOT NULL DEFAULT (UNIXEPOCH('now', 'localtime') * 1000)
) STRICT;
CREATE INDEX IF NOT EXISTS idx_user_id ON Modmail (user_id);

CREATE TABLE IF NOT EXISTS TemporaryRoles (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    PRIMARY KEY (guild_id, user_id, role_id)
) STRICT;

CREATE TABLE IF NOT EXISTS GuildSettings (
	guild_id TEXT NOT NULL PRIMARY KEY,

    modmail_channel_id TEXT, -- Channel where modmail threads are created

	help_channel_id TEXT,
    solved_tag_id TEXT
) STRICT;

CREATE TABLE IF NOT EXISTS ActiveHelpChannels (
    channel_id TEXT NOT NULL PRIMARY KEY,
    last_message_timestamp INTEGER NOT NULL DEFAULT (UNIXEPOCH('now', 'localtime') * 1000)
) STRICT;