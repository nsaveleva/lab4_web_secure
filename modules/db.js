const mysql = require('mysql');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const options = {
	host: 'db',
	port: 3306,
	user: 'root',
	password: '',
	database: 'web_secure'
};

let connection;

function init(callback) {
	connection = mysql.createConnection(options);
	let sessionStore = new MySQLStore({}, connection);

	connection.connect((err) => {
		if (err) throw err;
		console.log("mysql connected");
		if(callback) callback(sessionStore, session);
	});

	connection.on("error", (err) => {
		if(err.code === "PROTOCOL_CONNECTION_LOST") {
			console.log("reconnect");
			init();
		} else {
			throw err;
		}
	});
}

function query(sql, data, callback) {
	connection.query(sql, data, (err, result) => {
		if(err) throw err;
		if(callback) callback(result);
	});
}

function beginTransaction(callback) {
	connection.beginTransaction((err) => {
		if (err) throw err;
		if(callback) callback();
	});
}

function commit(callback) {
	connection.commit((err) => {
		if (err) throw err;
		if(callback) callback();
	});
}

function rollback(callback) {
	connection.rollback((err) => {
		if (err) throw err;
		if(callback) callback();
	});
}

function end(callback) {
	connection.end((err) => {
		if (err) throw err;
		if(callback) callback();
	});
}

function prQuery (sql, data) {
	return new Promise ((resolve, reject) => {
		sql = sqlString.format(sql,data);
		connection.query(sql, (err, res) => {
			// console.log('ERROR');
			// console.log(err);
			// console.log(res);
			if(err) {

				reject(err);
			} else {
				resolve(res);
			}
		});
	});
};

module.exports = {
	init: init,
	query: query,
	beginTransaction: beginTransaction,
	rollback: rollback,
	commit: commit,
	end: end,
	prQuery: prQuery,
};
