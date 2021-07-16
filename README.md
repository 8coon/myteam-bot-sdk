# Myteam Bot SDK

![Coverage](https://8coon.github.io/myteam-bot-sdk/badges/coverage.svg)
![Node](https://8coon.github.io/myteam-bot-sdk/badges/node.svg)
[![NPM](https://8coon.github.io/myteam-bot-sdk/badges/npm.svg)](https://www.npmjs.com/package/myteam-bot-sdk)

Открытый SDK для создания ботов в мессенджере [Myteam](https://biz.mail.ru/myteam/).

В наличии имеется:
- тайпинги на все ответы сервера согласно официальной [документации](https://myteam.mail.ru/botapi/);
- методы для:
	- [обработки команд]()
	- [отправки сообщений]()
	- [обработки кликов по кнопкам]()
	- и [другие]()
- методы для прямого [хождения в API]() (на основе [node-fetch](https://www.npmjs.com/package/node-fetch));
- конструктор [форматированных сообщений]();
- и другое!

_Этот проект создавался в свободное время и не имеет отношения к разработчикам Myteam!_

## Установка

SDK рассчитан для работы в Node 16. Работать в более ранних версиях оно может, но это неточно.

Для установки выполните следующее:

```shell
npm i myteam-bot-sdk
```

## Использование

- [Документация](https://8coon.github.io/myteam-bot-sdk/#/)
- [Пример бота: Poll](https://github.com/8coon/myteam-bot-sdk/tree/master/examples/poll)

## Разработка

### Сборка

```shell
npm run build
```

- [TypeScript](https://www.typescriptlang.org/)
- [Rollup](https://rollupjs.org/guide/en/)

### Тестирование

Запуск тестов локально:

```shell
npm test
```

- [Jest](https://jestjs.io/ru/)
- [ts-jest](https://github.com/kulshekhar/ts-jest)

Информация о покрытии будет находиться в папке coverage.

### Изменение документации

Для запуска документации локально нужно установить
[docsify-cli](https://www.npmjs.com/package/docsify-cli:

```shell
npm i -G docsify-cli
```

После этого можно запустить сервер с документацией с помощью команды:

```shell
npm run docs
```

Сервер будет доступен по адресу [http://localhost:3000](http://localhost:3000).
