const xss = require("xss");
const _ = require('underscore');

function checkEmptyAndXss(anyArray) {
	let flagValidate = true;
	anyArray.forEach((el) => {
		if(_.isEmpty(el)) {
			flagValidate = false;
			return;
		}
		if(el != xss(el)) {
			flagValidate = false;
			return ;
		}
	});

	return flagValidate;
}

module.exports = {
	checkEmptyAndXss: checkEmptyAndXss,
};