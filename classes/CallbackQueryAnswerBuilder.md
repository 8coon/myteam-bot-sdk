# CallbackQueryAnswerBuilder

Этот класс позволяет построить ответ на событие `callbackQuery`.

```js
import {MyTeamSDK} from 'myteam-bot-sdk';

const sdk = new MyTeamSDK({
	token: process.env.EXAMPLE_TOKEN,
});

sdk.on('callbackQuery', (event) => {
	// Для события callbackQuery event.replyData имеет тип CallbackQueryAnswerBuilder
	// Код приведёт к тому, что пользователю будет покзаан алерт с указанным текстом
	event.replyData.alert('Нажали кнопку!');
})
```

## Поля

### textValue?: string
Может хранить в себе значение параметра `text` метода
[/messages/answerCallbackQuery](https://myteam.mail.ru/botapi/#/messages/get_messages_answerCallbackQuery),
если он задан и не задан параметр `url`.

### urlValue?: string
Может хранить в себе значение параметра `text` метода
[/messages/answerCallbackQuery](https://myteam.mail.ru/botapi/#/messages/get_messages_answerCallbackQuery),
если он задан и не задан параметр `text`.

### showAlert?: boolean
Если задан `true` и передать параметр `text`, вместо
нотификации будет показан алерт.

## Методы

### text(value: string): CallbackQueryAnswerBuilder
Показ обычного текстового уведомления внизу окна.

Задаёт значение `textValue`, сбрасывает значение `urlValue` и флаг `showAlert`.

### alert(text: string): CallbackQueryAnswerBuilder
Показ текстового уведомления во весь экран.

Задаёт значение `textValue` и флаг `showAlert`, сбрасывает значение `urlValue`.

### url(value: string): CallbackQueryAnswerBuilder
Переход по ссылке.

Задаёт значение `urlValue`, сбрасывает значение `textValue` и флаг `showAlert`.

### toObject(): Record<string, string>
Возвращет объект с параметрами в формате, который принимает метод
[/messages/answerCallbackQuery](https://myteam.mail.ru/botapi/#/messages/get_messages_answerCallbackQuery).

Подходит для использования вместе с методом
[URLBuilder.appendQueryObject](classes/URLBuilder?id=appendqueryobjectvalue-recordltstring-number-string-numbergt-urlbuilder).
