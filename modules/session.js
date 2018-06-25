const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const db = require('./db').db;
const sessionStore = new MySQLStore({}, db);

exports.sessionsStore = sessionStore;
exports.session = session;