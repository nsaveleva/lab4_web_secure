const CONFIG = require('./config.json');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./modules/db');
const _ = require('underscore');
const hash = require('./modules/hash');

const PORT = process.env.PORT || CONFIG.port;
app.use(bodyParser.json());
app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(500).send('Backend Error');
});

function checkUser(login, password, callback) {
	db.query('SELECT hash FROM users WHERE user_id = ?', [login], (result) => {
		if(hash.hashNotEmpty(result)) {
			return callback(hash.checkPassword(password,result[0].hash));
		} else {
			callback(false);
		}
	});
}

app.listen(PORT, () => {
	db.init((sessionStore, session) => {
		app.use(session({
			key: 'cookie_name',
			secret: 'HnteV6Yp5KkgxyE2WxXKhEXQK3XrpqtZqZaGoTCf',
			store: sessionStore,
			resave: false,
			saveUninitialized: false
		}));

		app.post('/auth', (req, res) => {
			let login = req.body.login;
			let password = req.body.password;

			if(_.isEmpty(login) || _.isEmpty(password)) {
				res.status(401).send('Not found password or login').end();
			} else {
				let hash = '';
				checkUser(login, password, (validPassword) => {
					if(validPassword) {
						res.status(200).send('Valid pass');
						req.session.user_id = login;
					} else {
						console.log('USER NOT VALID PASSWORD');
						res.status(401).send('NOT VALID PASSWORD');
					}
				});
			}
		});
	});
});



