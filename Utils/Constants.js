const ROOT_FOLDER = __dirname + '/..';

const DB_SETUP_FILE = `${ROOT_FOLDER}/DB_SETUP.sql`;
const DB_FILE = `${ROOT_FOLDER}/api.sqlite`;

const SECONDS = {
	MINUTE: 60,
	HOUR: 	60 * 60,
	DAY: 	60 * 60 * 24,
	WEEK: 	60 * 60 * 24 * 7,
	MONTH: 	60 * 60 * 24 * 30,
	YEAR: 	60 * 60 * 24 * 365
}

const CORES_AVAILABLE = require('os').cpus().length;

const STAFF_ROLES = [
	'1385212054041923601', // head admin
	'1389787464813514774', // moderator
	'1427890838373007462', // helper

	'846774996370325525' // my test role lol
]

module.exports = {
	ROOT_FOLDER,

	DB_SETUP_FILE,
	DB_FILE,

	SECONDS,

	CORES_AVAILABLE,

	STAFF_ROLES
}