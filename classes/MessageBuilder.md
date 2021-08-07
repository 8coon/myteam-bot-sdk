# MessageBuilder

Этот класс позволяет составлять форматированные сообщения.

```javascript
import {MyTeamSDK} from 'myteam-bot-sdk';

const sdk = new MyTeamSDK({
	token: process.env.EXAMPLE_TOKEN,
});

sdk.sendText('admin@myteam.ru', new MessageBuilder.text('Сообщение'));
```

## Поля

### textValue: string

### replyMsgId: string[]

### forwardChatId: string[]

### inlineKeyboardMarkup?: MyTeamButton[][]

### format?: Partial<MyTeamFormat>

### parseMode?: string

## Методы

### text(value: string): MessageBuilder

### replyTo(msgId: string): MessageBuilder

### forwardFrom(msgId: string, chatId: string): MessageBuilder

### buttonRow(): MessageBuilder

### button(button: MyTeamButton): MessageBuilder

### formatText(type: keyof MyTeamFormat | 'none', value: string): MessageBuilder

### formatRange(type: keyof MyTeamFormat, value: string): MessageBuilder

### markdown(value: string): MessageBuilder

### html(value: string): MessageBuilder

### toObject(): Record<string, string>
Возвращет объект с параметрами в формате, который принимает метод
[/messages/sendText](https://myteam.mail.ru/botapi/#/messages/get_messages_sendText).

Подходит для использования вместе с методом
[URLBuilder.appendQueryObject](classes/URLBuilder?id=appendqueryobjectvalue-recordltstring-number-string-numbergt-urlbuilder).
