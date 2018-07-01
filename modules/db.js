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
		if(callback) callback(sessionStore, session, connection);
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
		if(err) console.error(err);
		if(callback) callback(result, err);
	});
}

function oneQuery(sql, data, callback) {
	let connection = mysql.createConnection(options);
	connection.connect((err) => {
		if (err) throw err;
	});

	connection.query(sql, data, (error, results, fields) => {
		if (error) throw error;
		if(callback) callback(results, fields, error);
	});

	connection.end();
}

module.exports = {
	init: init,
	query: query,
	oneQuery: oneQuery,
};
