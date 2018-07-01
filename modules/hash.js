const crypto = require('crypto');
const _ = require('underscore');

function checkPassword(password, saltHash) {
	let salt = saltHash.split(':')[0];
	let hash = saltHash.split(':')[1];
	let genHash = crypto.createHmac('sha256', salt)
		.update(password)
		.digest('hex');
	return (hash === genHash);
}

function hashNotEmpty(hash) {
	try {
		if(!_.isEmpty(hash[0].hash)) {
			return true;
			// bug underscore isEmpty выдает true если hash[0].hash - число
		} else if (!_.isNan(hash[0].hash)) {
			return true;
		}
		return false;
	} catch (e) {
		return false;
	}
}

function genSalt (length = 12) {
	return crypto.randomBytes(256).toString('hex').substring(0, length);
}

function genHashWithSalt(password) {
	let salt = genSalt();
	let hash = crypto.createHmac('sha256', salt)
		.update(password)
		.digest('hex');
	return salt + ':' + hash;
}

module.exports = {
	checkPassword: checkPassword,
	hashNotEmpty: hashNotEmpty,
	genHashWithSalt: genHashWithSalt,
}