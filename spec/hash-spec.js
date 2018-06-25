const hash = require('../modules/hash');
const crypto = require('crypto');

function sha256 (pass, salt) {
	return crypto.createHmac('sha256', salt)
		.update(pass)
		.digest('hex');
}

describe("Check hash.js: ", () => {
	it('Check hashNotEmpty', () => {
		let a = [ {hash: 'sdvdsvdsvsvdsvdsv'}]
		expect(hash.hashNotEmpty(a)).toBe(true);
	});
	it('Check hashNotEmpty empty hash', () => {
		let a = [{hash: ''}];
		expect(hash.hashNotEmpty(a)).toBe(false);
	});
	it('Check hashNotEmpty any array', () => {
		let a = [1, 2, 3];
		expect(hash.hashNotEmpty(a)).toBe(false);
	});
	it('Check hashNotEmpty empty hash', () => {
		let a = {};
		expect(hash.hashNotEmpty(a)).toBe(false);
	});
	it('Check hashNotEmpty empty string', () => {
		let a = '';
		expect(hash.hashNotEmpty(a)).toBe(false);
	});
	it('Check hashNotEmpty hash = number', () => {
		let a = [ {hash: '1111'} ];
		expect(hash.hashNotEmpty(a)).toBe(true);
	});
	
	it('Check checkPassword valid password', () => {
		let pass = 'test_password';
		let salt = 'adrgh23grb';
		let saltHash = salt + ':' + sha256(pass, salt);
		expect(hash.checkPassword(pass, saltHash)).toBe(true);
	});
	it('Check checkPassword not valid password', () => {
		let pass = 'test_password';
		let salt = 'adrgh23grb';
		let saltHash = salt + ':' + sha256(pass, salt);
		expect(hash.checkPassword('test', saltHash)).toBe(false);
	});
});
