const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const helmet = require('helmet'); //security
const _ = require('underscore');

const CONFIG = require('./config.json');
const api = require('./modules/api');
const db = require('./modules/db');
const validate = require('./modules/validate');

const PORT = process.env.PORT || CONFIG.port;
app.use(bodyParser.json());
app.use(helmet());
app.use( (err, req, res, next) =>  {
	console.error(err.stack);
	res.status(500).send('Backend Error');
});

app.use( (req, res, next) => {
	res.header("Content-Type", "application/json; charset=UTF-8");
	let re = new RegExp("^https?://(local\.saveleva\.lab4|saveleva\.com|nsaveleva\.github\.io')");
	if( re.test(req.headers.origin) ) {
		console.log('SET HEADER');
		res.header("Access-Control-Allow-Origin", req.headers.origin);
		res.header("Access-Control-Allow-Methods", '*');
		res.header("Access-Control-Allow-Headers", '*');
	}
	next();
});

function checkAccess(req, res, next) {
	if (req.session.user_id) {
		api.findUser(req.session.user_id, (existUser) => {
			if(existUser) {
				next();
			}
			else {
				res.status(403).send('User not found').end();
			}
		});
	} else {
		res.status(403).send('Access denied').end();
	}
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
		// Rest API

		app.post('/auth', (req, response) => {
			let login = req.body.login;
			let password = req.body.password;

			if(_.isEmpty(login) || _.isEmpty(password)) {
				response.status(401).send('Not found password or login').end();
			} else {
				let hash = '';
				api.checkUser(login, password, (validPassword) => {
					if(validPassword) {
						api.getPasswords(login, (passwords) => {
							req.session.user_id = login;
							api.getPrivateKey(login, (res) => {
								let privateKey = res['private_key'];
								response.status(200).send(JSON.stringify({passwords: passwords, privateKey: privateKey}));
							});
						});
					} else {
						console.log('USER NOT VALID PASSWORD');
						response.status(401).send('NOT VALID PASSWORD');
					}
				});
			}
		});

		app.delete('/auth', (req, response) => {
			req.session.destroy((err) => {
				if(err) {
					console.error(err);
					response.status(500).send('Cannot destroy session');
				} else {
					response.status(200).send(JSON.stringify('Success'));
				}
			});
		});

		app.get('/passwords', checkAccess, (req, response) => {
			api.getPasswords(req.session.user_id, (passwords) => {
				response.status(200).send( JSON.stringify(passwords) );
			});
		});

		app.delete('/password', checkAccess, (req, response) => {
			let login = req.body.login;
			let service = req.body.service;
			api.deleteService(req.session.user_id, service, login, (result) => {
				if (result) {
					response.status(200).send(JSON.stringify('success'));
				} else {
					response.status(500).send(JSON.stringify('Unknown error'));
				}
			})
		});

		app.put('/password', checkAccess, (req, response) => {
			let login = req.body.login;
			let service = req.body.service;
			let password = req.body.password;
			let newLogin = req.body.newLogin;
			let newService = req.body.newService;
			if( validate.checkEmptyAndXss([login, service, password, newLogin, newService]) ) {
				api.addService(req.session.user_id, service, login, password, newService, newLogin, (result) => {
					if (result) {
						response.status(200).send(JSON.stringify('success'));
					} else {
						response.status(500).send(JSON.stringify('Unknown error'));
					}
				});
			} else {
				response.status(500).send('Wrong data');
			}
		});
	});
});