# URLBuilder

Этот класс позволяет удобно построить URL для обращения в API Myteam.

```js
import {URLBuilder} from 'myteam-bot-sdk';

// Напечатает 'https://myteam.mail.ru/bot/v1/messages/sendText?chatId=my%40chat
console.log(
	new URLBuilder('messages/sendText', 'https://myteam.mail.ru/bot/v1/')
		.appendQuery('chatId', 'my@chat')
		.toString()
);
```

## Методы

Почти все методы возвращают `this`, что позволяет их чейнить.

### constructor(url: string, baseUrl?: string)
 - url &mdash; метод API либо абсолютный URL;
 - baseUrl &mdash; базовый URL в случае указания относительного URL в первом аргументе.

### appendQuery(name: string, value: string | number): URLBuilder
Добавляет или заменяет query-параметр.

 - name &mdash; имя query-параметра;
 - value &mdash; значение (будет корректно кодировано для помещения в URL).

### appendQueryIfTruthy(name: string, value?: string | number): URLBuilder
Добавляет или заменяет query-параметр, если `value` это истинное значение.

- name &mdash; имя query-параметра;
- value &mdash; значение (будет корректно кодировано для помещения в URL).

### appendQueryObject(value: Record<string | number, string | number>): URLBuilder
Добавляет или заменяет набор query-параметров.

- value &mdash; набор пар имя-значение.

### toString(): string
Возвращает строковое представление полученного URL.
