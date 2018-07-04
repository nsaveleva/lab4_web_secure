# Лабороторная раюота №4
## Ссылки
* https://nsaveleva.github.io/lab4_web_secure/web/
*  https://saveleva.ml/

## Постановка задачи
* Задача: "Создать защищенное веб-приложение"

> Да, да. Я серьезно, это всё задание, никаких других пояснений к нему не давали...

* Цель: неизвестно
> очевидно из задачи, трудно придумать какая тут может быть цель =). Вот такая у нас замечательная система образования

Так как никаких подробностей по заданию нет, я взяла на себя смелость примерно самой прикинуть, что требуется сделать. Как я поняла, нужно сделать какое-то веб-приложение и проанализировать его защищенность.


## Описание приложения

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
