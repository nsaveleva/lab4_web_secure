#!/usr/bin/env node
const _ = require('underscore');

const hash = require('./modules/hash');
const db = require('./modules/db');
const forge = require('node-forge');

let user = process.argv[2];
let password = process.argv[3];

if(_.isEmpty(user) || _.isEmpty(password)) {
	console.error('Empty user or password');
	process.exit(1);
}

let passwordHash = hash.genHashWithSalt(password);

// let salt = forge.random.getBytesSync(256);
// let key = forge.pkcs5.pbkdf2(password, salt, 2, 16);
// console.log(key);
// let iv = forge.random.getBytesSync(16);
// console.log('Create encrypt by key');
// let cipher = forge.cipher.createCipher('AES-CBC', key);
// console.log('Start generate key pair');
// let keypair = forge.pki.rsa.generateKeyPair({bits: 2048, e: 0x10001});
//
// console.log('Start encrypt private key');
// cipher.start({iv: iv});
// cipher.update(forge.util.createBuffer(forge.pki.privateKeyToPem(keypair.privateKey)));
// cipher.finish();
//
// console.log('Public key: ');
// console.log(forge.pki.publicKeyToPem(keypair.publicKey));
// console.log('Private key: ');
// console.log(forge.pki.privateKeyToPem(keypair.privateKey));
// console.log('Encrypt Private key: ');
// console.log(cipher.output.toHex());


db.oneQuery('INSERT INTO users VALUES(?,?)', [user, passwordHash], (res, fields, err) => {
	if(err) throw err;
});