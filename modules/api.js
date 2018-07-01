const _ = require('underscore');

const db = require('./db');
const validate = require('./validate');
const hash = require('./hash');

function checkUser(userId, password, callback) {
	db.query('SELECT hash FROM users WHERE user_id = ?', [userId], (result) => {
		if(hash.hashNotEmpty(result)) {
			return callback(hash.checkPassword(password,result[0].hash));
		} else {
			callback(false);
		}
	});
}

function findUser(userId, callback) {
	db.query('SELECT user_id FROM users WHERE user_id = ? ', [userId], (result) => {
		callback(!_.isEmpty(result)); //Если пользователь существует вернет true, иначе false
	});
}

function getPasswords(userId, callback) {
	db.query('SELECT service, login, password FROM passwords WHERE user_id = ?', [userId], (result) => {
		callback(result);
	});
}

function deleteService(userId, service, login, callback) {
	db.query(
		'DELETE FROM passwords WHERE user_id = ? AND service = ? AND login = ?',
		[userId, service, login],
		(res, err) =>
		{
			if(err) {
				callback(false);

			} else {
				callback(true);
			}
		});
}

function addService(userId, service, login, password, newService, newLogin, callback) {
	if(validate.checkEmptyAndXss([service, login, password, newService, newLogin])) {
		db.query(
			'INSERT INTO passwords VALUES(?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = ?, service = ?, login = ?',
			[userId, service, login, password, password, newService, newLogin],
			(res, err) =>
			{
				if(err) {
					callback(false);

				} else {
					callback(true);
				}
			});
	} else {
		console.error('service or login or password is empty');
		callback(false);
	}
}

module.exports = {
	checkUser: checkUser,
	findUser: findUser,
	getPasswords: getPasswords,
	deleteService: deleteService,
	addService: addService,
};