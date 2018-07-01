#!/usr/bin/env node
const _ = require('underscore');

const hash = require('./modules/hash');
const db = require('./modules/db');
const forge = require('node-forge');
const aes = require("crypto-js/aes");

let user = process.argv[2];
let password = process.argv[3];

if(_.isEmpty(user) || _.isEmpty(password)) {
	console.error('Empty user or password');
	process.exit(1);
}

let passwordHash = hash.genHashWithSalt(password);
let keypair = forge.pki.rsa.generateKeyPair({bits: 2048, e: 0x10001});
let privateKeyEncrypt = aes.encrypt(forge.pki.privateKeyToPem(keypair.privateKey), password).toString();

db.oneQuery('INSERT INTO users VALUES(?,?)', [user, passwordHash], (res, fields, err) => {
	if(err) throw err;

	db.oneQuery('INSERT INTO rsa_keys VALUES(?,?,?)', [user, privateKeyEncrypt, forge.pki.publicKeyToPem(keypair.publicKey)], (res, fields, err) => {
		if(err) throw err;
	});
});

