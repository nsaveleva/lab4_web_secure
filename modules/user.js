const db = require('./db').db;
const crypto = require('crypto');


class User {
	constructor(login) {
		this.name = login;
		 db.query('SELECT hash FROM users WHERE user_id = ?', [login], (hash) => {
		 	this.hash = hash[0];
		 })
		// let salt = crypto.randomBytes(Math.ceil(10/2))
		// 	.toString('hex')
		// 	.slice(0,10);
		// let hash = crypto.createHmac('sha256', salt)
		// 	.update(password)
		// 	.digest('hex');
		// hash = salt + ':' + hash;
		// db.query('INSERT INTO users (user_id, hash) VALUES (?, ?)', [login, hash]);
	}




}


exports.User = User;