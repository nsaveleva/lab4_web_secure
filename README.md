# Лабороторная работа №4
## Ссылки
Сервер проекта развёрнут в одном месте, но клиентская часть доступна в двух местах:
* https://nsaveleva.github.io/lab4_web_secure/web/
* https://saveleva.ml/

Сам сервер находится на сервере saveleva.ml

## Постановка задачи
* Задача: "Создать защищенное веб-приложение"

> Да, да. Я серьезно, это всё задание, никаких других пояснений к нему не давали... 

* Цель: неизвестно
> очевидно из задачи, трудно придумать какая тут может быть цель =). Вот такая у нас замечательная система образования

> P.S. вряд-ли препод будет копаться в коммитах проекта... 

Так как никаких подробностей по заданию нет, я взяла на себя смелость, примерно самой прикинуть, что требуется сделать. Как я поняла, нужно сделать какое-то веб-приложение и проанализировать его защищенность.


## Описание приложения
Так как я плохо знаю javascript, решила, в целях обучения реализовать проект полностью на нем (клиент и сервер).
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

#### Сервер (бэкенд)

* **javascript** (nodejs) на веб-фреймворке [expressjs](https://expressjs.com/)
* **nginx** - веб-сервер
* **mysql** - база данных
* **docker** - приложение развертывается внутри контейнеров **docker**

##### Дополнительные библиотеки javascript (nodejs)

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
Проверку того, что пользователь есть в базе, и пароль его совпдадает с введенным, осуществляет функция ([из файла api.js](modules/api.js)):
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
То есть нам удалось успешно выполнить не предусмотренный SQL запрос. Теперь посмотрим, что происходит на самом деле:
![sql_inject3](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/sql_inject3.jpg)
Как видно из журнала базы данных, все что было в поле **username** попало в плейсхолдер и окаозалось просто паремтром с которым сравнивается колонка **user_id**, все ковычки экранированы как и положено. И данный запрос конечно ничего не вернет:
![sql_inject4](https://github.com/nsaveleva/lab4_web_secure/raw/master/docs/images/sql_inject4.jpg)

Вывод: используете подготовленные выражения, не формируйте SQL запросы из входных данных. За это нужно бить палками!
