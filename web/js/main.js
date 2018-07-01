
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
			let passwords = JSON.parse(res);
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

	$('#search_input').focus( () => {
		$('#search_input')[0].value = '';
	});

	$('#search_input').keyup( () => {
		let searchStr = $('#search_input')[0].value.toLowerCase();
		let findPasswords = [];
		if(searchStr.length == 0) {
			renderMainApp(passwords)
		} else {
			passwords.forEach( (elem) => {
				if(elem.service.toLowerCase().indexOf(searchStr) >= 0 || elem.login.toLowerCase().indexOf(searchStr) >= 0) {
					findPasswords.push(elem);
				}
			});
			renderMainApp(findPasswords);
		}
	});

	$('#btn_add').click( (e) => {
		e.preventDefault();
		let popupTemplate = _.template($('#popup')[0].innerHTML);
		$('.main_container').append(popupTemplate());

		$('#btn_cancel').click( (e) => {
			e.preventDefault();
			$('.b-popup').remove();
		});
		$('#add_service').focus( () => {
			$('#add_service')[0].value = '';
		});

		$('#add_service').focus();

		$('#add_login').focus( () => {
			$('#add_login')[0].value = '';
		});

		$('#add_password').focus( () => {
			$('#add_password')[0].value = '';
		});

		$('#btn_add_password').click( (e) => {
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
					console.log('Add success');
					passwords.push({'service': service, 'login': login, 'password': password});
					renderMainApp(passwords);
					$('.b-popup').remove();
				},
				error: (err) => {
					console.error('Add error');
					console.error(err);
				}
			});
		});
	});
}

function renderMainApp (passwords) {
	$('.entries').empty();
	let oneEntryTemplate = _.template($('#one_entry_password')[0].innerHTML);
		passwords.forEach((service, i) => {
			if(_.isEmpty(service)) {return;}
			$('.entries').append(oneEntryTemplate({service: service, numberOfElement: i}));
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
						if ($('#form_' + i).parent().next()[0].tagName == 'BR') {
							$('#form_' + i).parent().next().remove();
						}
						$('#form_' + i).parent().remove();
						passwords[i] = null;
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
				} else {
					$('#password_' + i)[0].type = 'password';
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

			success: (res) => {
				auth = null; login = null; password = null; // clean secure data
				let passwords = JSON.parse(res);
				initApp(passwords);
			},
			error: (res) => {
				auth = null; login = null; password = null; //clean secure data
				if(res.status == 401) {
					$('.main_container').append('<p id="notification">Неверные логин и пароль</p>');
				} else {
					$('.main_container').append('<p id="notification">Неизвестная ошибка сервера</p>');
				}
			}
		});
	});

	$('#login_field').focus( () => {
		let login_field = $('#login_field');
		login_field[0].value = '';
		login_field.removeClass('login_input');

	});

	$('#login_password').focus( () => {
		let login_password = $('#login_password');
		login_password[0].value = '';
		login_password.removeClass('login_input');
	});
}