
let apiUrl;
let host = window.location.host.split(':')[0];
let port = window.location.host.split(':')[1] || '';

if(host == 'local.saveleva.lab4') {
	apiUrl = window.location.protocol + '//' + host + ':' + port;
} else {
	apiUrl =  window.location.protocol + '//' + 'saveleva.ml';
}
// load page done
$(document).ready( () => {
	$.ajax({
		url: apiUrl +  "/passwords",
		type: "GET",
		contentType: 'application/json; charset=UTF-8',
		success: (res) => {
			let passwords = res;
			initApp(passwords);
		},
		error: () => {
			auth();
		}
	});
});

function initApp (passwords) {
	$('.main_container').empty();
	let mainTemplate = _.template($('#main_app')[0].innerHTML);
	$('.main_container').append( mainTemplate() );

	$('#logout').click( (e) => {
		e.preventDefault();
		$.ajax({
			url: apiUrl +  "/auth",
			type: "DELETE",
			contentType: 'application/json; charset=UTF-8',
			success: () => {
				console.log('Logout Success');
				auth();

			},
			error: (err) => {
				console.error('Logout error');
				console.error(err);
			}
		});
	});

	renderMainApp(passwords);

	$('#search_input').keyup( () => {
		let searchStr = $('#search_input')[0].value.toLowerCase();
		let findPasswords = [];
		if(searchStr.length == 0) {
			renderMainApp(passwords, false)
		} else {
			passwords.forEach( (elem) => {
				if(elem.service.toLowerCase().indexOf(searchStr) >= 0 || elem.login.toLowerCase().indexOf(searchStr) >= 0) {
					findPasswords.push(elem);
				}
			});
			renderMainApp(findPasswords, false);
		}
	});

	$('#btn_add').click( (e) => {
		e.preventDefault();
		let popupTemplate = _.template($('#popup')[0].innerHTML);
		$('body').append(popupTemplate());

		$('#btn_cancel').click( (e) => {
			e.preventDefault();
			$('.b-popup').remove();
		});

		$('#add_service').focus();

		$('#btn_add_password').submit( (e) => {
			e.preventDefault();
			let service = $('#add_service')[0].value;
			let login = $('#add_login')[0].value;
			let password = $('#add_password')[0].value;
			$.ajax({
				url: apiUrl +  "/password",
				type: "PUT",
				contentType: 'application/json; charset=UTF-8',
				data: JSON.stringify({
					'service': service,
					'login': login,
					'newService': service,
					'newLogin': login,
					'password': password
				}),
				success: () => {
					$('.b-popup').remove();
					passwords.push({'service': service, 'login': login, 'password': password});
					console.log('Add success');
					renderMainApp(passwords, false);
				},
				error: (err) => {
					console.error('Add error');
					console.error(err);
				}
			});
		});
	});
}

function renderMainApp (passwords, encrypt = true) {
	let privateKey =  forge.pki.privateKeyFromPem(localStorage.getItem('key'));
	function decryptPassword (password) {
		password = forge.util.decode64(password);
		password = privateKey.decrypt(password);
		return password;
	}
	$('#entries').empty();
	let oneEntryTemplate = _.template($('#one_entry_password')[0].innerHTML);
		passwords.forEach((service, i) => {
			if(_.isEmpty(service)) {
				return;
			}
			if(encrypt) {
				service.password = decryptPassword(service.password);
			}
			$('#entries').append(oneEntryTemplate({service: service, numberOfElement: i}));
			$('#btn_save_' + i).click((e) => {
				e.preventDefault();
				savePassword(passwords, i);
			});
			$('#btn_delete_' + i).click((e) => {
				e.preventDefault();
				let service = $('#service_' + i)[0].value;
				let login = $('#login_' + i)[0].value;
				$.ajax({
					url: apiUrl +  "/password",
					type: "DELETE",
					contentType: 'application/json; charset=UTF-8',
					data: JSON.stringify({
						'service': service,
						'login': login,
					}),
					success: () => {
						console.log('Delete success');
						$('#form_' + i).remove();
						passwords.splice(i,1);
					},
					error: (err) => {
						console.error('Delete error');
						console.error(err);
					}
				});
			});

			$('#form_' + i).submit((e) => {
				e.preventDefault();
				savePassword(passwords, i);
			});

			$('#btn_copy_' + i).click((e) => {
				e.preventDefault();
				$('#password_' + i)[0].type = 'text';
				$('#password_' + i).select();
				document.execCommand('copy');
				$('#password_' + i)[0].type = 'password';
				$('#password_' + i).blur();
			});

			$('#btn_show_' + i).click((e) => {
				e.preventDefault();
				if ($('#password_' + i)[0].type == 'password') {
					$('#password_' + i)[0].type = 'text';
					$('#btn_show_' + i).removeClass('glyphicon-eye-close');
					$('#btn_show_' + i).addClass('glyphicon-eye-open');

				} else {
					$('#password_' + i)[0].type = 'password';
					$('#btn_show_' + i).removeClass('glyphicon-eye-open');
					$('#btn_show_' + i).addClass('glyphicon-eye-close');
				}
			});
		});
}

function savePassword (passwords, i) {
	let service = $('#service_' + i)[0].value;
	let login = $('#login_' + i)[0].value;
	let password = $('#password_' + i)[0].value;
	let oldService = passwords[i]['service'];
	let oldLogin = passwords[i]['login'];
	let oldPassword = passwords[i]['password'];
	$.ajax({
		url: apiUrl +  "/password",
		type: "PUT",
		contentType: 'application/json; charset=UTF-8',
		data: JSON.stringify({
			'service': oldService,
			'login': oldLogin,
			'newService': service,
			'newLogin': login,
			'password': password
		}),

		success: () => {
			console.log('Save success');
			passwords[i]['service'] = service;
			passwords[i]['login'] = login;
			passwords[i]['password'] = password;
		},
		error: (err) => {
			$('#service_' + i)[0].value = oldService;
			$('#login_' + i)[0].value = oldLogin;
			$('#password_' + i)[0].value = oldPassword;
			console.error('Save error');
			console.error(err);
		}
	});
}
function auth () {
	$('.main_container').empty();
	let authTemplate = _.template($('#auth_app')[0].innerHTML);
	$('.main_container').append(authTemplate());

	// Auth
	$('#login_form').submit( (e) => {
		e.preventDefault();
		let login = $('#login_field')[0].value;
		let password = $('#login_password')[0].value;
		let auth = {'login': login, 'password': password};
		$.ajax({
			url: apiUrl +  "/auth",
			type: "POST",
			data: JSON.stringify(auth),
			contentType: 'application/json; charset=UTF-8',

			success: (response) => {
				let passwords = response['passwords'];
				let privateKey = response['privateKey'];
				localStorage.setItem('key', CryptoJS.AES.decrypt(privateKey, password).toString(CryptoJS.enc.Utf8));
				auth = null; login = null; password = null; // clean secure data
				initApp(passwords);
			},
			error: (res) => {
				auth = null; login = null; password = null; //clean secure data
				if(res.status == 401) {
					$('#notification')[0].textContent = 'Неверные логин и пароль';
				} else if(res.status == 503) {
					$('#notification')[0].textContent = 'Вы превысили лимит попыток';
				} else {
					$('#notification')[0].textContent = 'Неизвестная ошибка сервера';
				}
			}
		});
	});
}