import {MessageBuilder, MyTeamSDK} from 'myteam-bot-sdk';

// "Модель" опроса
interface Poll {
	// Пользователь, создавший опрос
	author: string;
	// Вопрос опроса
	question: string;
	// Варианты ответа (количество голосов за каждый вариант)
	options: { text: string, votes: number }[];
	// Словарь проголосовавших пользователей (чтобы нельзя было голосовать дважды)
	usersVoted: Record<string, true>;
	// id сообщения с опросом
	messageId?: string;
}

// Тут указываем настройки SDK
const sdk = new MyTeamSDK({
	// Ник бота: example.poll.bot
	// Для запуска в вашем домене MyTeam, создайте у себя тестового бота и вставьте его токен сюда
	token: '' || process.env.EXAMPLE_TOKEN,

	// Тут нужно указать адрес API именно вашей установки MyTeam!
	// Если вы его не знаете, обратитесь к своему системному администратору
	baseURL: process.env.MYTEAM_API_URL,
});

// Будем инкрементально увеличивать при создании нового опроса и использовать в качестве id
let lastPollId = 0;
// Хранилище опросов
// В реальной жизни это нужно хранить в файле / БД / Firebase,
// иначе при рестарте бота данные по текущим опросам будут теряться
// Но у нас пример, поэтому просто храним в памяти
const polls: Record<string, Poll | undefined> = {};

sdk.addCommand('/poll', async (ctx) => {
	// Парсим аргументы регуляркой
	// SDK никак не обрабатывает содержимое сообщения пользователя кроме обрезания имени команды
	// Так что делаем это тут
	const args: string[] = [...ctx.args.matchAll(/"(.+?)"/g)].map(_ => _[1]);
	const question = args.shift();

	// Пользователь не задал вопрос
	if (!question) {
		return ctx.sdk.sendText(ctx.event.payload.chat.chatId, 'Вы не указали вопрос для опроса!');
	}

	// Пользователь не задал ни одного варианта ответа
	if (!args.length) {
		return ctx.sdk.sendText(ctx.event.payload.chat.chatId, 'Вы не указали ни одного варианта ответа!');
	}

	// Создаём новый опрос в хранилище
	const pollId = ++lastPollId;
	polls[pollId] = {
		author: ctx.event.payload.from.userId,
		question,
		// Выставляем все голоса в 0
		options: args.map((text) => ({
			text,
			votes: 0,
		})),
		// Ещё никто не голосовал
		usersVoted: {},
	};

	// Форматируем сообщение с вариантами ответа
	const message = new MessageBuilder()
		.text('📊')
		.text(` [${pollId}] `)
		.formatText('bold', `Опрос: ${question}`);

	// Добавляем в сообщение кнопки
	for (let i = 0; i < args.length; i++) {
		const optionText = args[i];

		message.buttonRow().button({
			style: 'primary',
			text: `▶️ ${optionText}`,
			// Эти данные придут нам в событии callbackQuery
			callbackData: JSON.stringify({pollId, option: i}),
		});
	}

	// Сохраняем id сообщения с опросом для последующего редактирования
	polls[pollId].messageId = await ctx.sdk.sendText(ctx.event.payload.chat.chatId, message);
});

sdk.addCommand('/pollend', (ctx) => {
	const pollId = parseInt(ctx.args);
	const poll = polls[pollId];

	// Проверяем, есть ли такой опрос
	if (!poll) {
		return ctx.sdk.sendText(ctx.event.payload.chat.chatId, `Опрос ${pollId} не найден!`);
	}

	// Завершать опрос может только автор
	if (poll.author !== ctx.event.payload.from.userId) {
		return ctx.sdk.sendText(ctx.event.payload.chat.chatId, `Ошибка доступа!`);
	}

	// Завершаем опрос
	delete polls[pollId];

	// Редактируем сообщение с опросом -- выводим результаты вместо кнопок
	const message = new MessageBuilder()
		.text('📊')
		.text(` [${pollId}] [завершено] `)
		.formatText('bold', `Опрос: ${poll.question}`);

	for (const option of poll.options) {
		message
			.formatText('none', '\n▶️ ' + option.text + ': ')
			.formatText('italic', String(option.votes));
	}

	ctx.sdk.editText(ctx.event.payload.chat.chatId, poll.messageId, message);
});

// Обратабываем нажание на кнопки в опросах
// Когда пользователь кликает на кнопку, клиент блокирует все кнопки в сообщении
// и рисует у кликнутой кнопки спиннер, а сервер сервер отправляет нам событие callbackQuery,
// передавая параметр callbackData кликнутой кнопки.
//
// Чтобы разблокировать кнопки и убрать спинер, надо ответить на это событие, отправив запрос на
// метод [answerCallbackQuery](https://myteam.mail.ru/botapi/#/messages/get_messages_answerCallbackQuery).
//
// SDK умеет это делать за нас, для этого в этом обработчике можно вызвать `event.answer()`
// Задавать параметры вызова можно с помощью `event.replyData`. Так можно показать пользователю
// краткое сообщение с произвольным текстом, отобразить алерт или заставить клиент открыть произвольную
// ссылку в браузере.
sdk.on('callbackQuery', (event) => {
	// Парсим данные кнопки, которые задали ей в обработчике команды /poll
	const {pollId, option} = JSON.parse(event.payload.callbackData);
	const poll = polls[pollId];

	// Опрос не найден
	if (!poll) {
		// При ответе покажем пользователю алерт с ошибкой
		event.replyData.alert('Ошибка! Опрос не найден.');
		// Отвечаем серверу на запрос callbackQuery
		return event.answer();
	}

	// Пользователь уже голосовал
	if (poll.usersVoted[event.payload.from.userId]) {
		event.replyData.alert('Ошибка! Вы уже голосовали в этом опросе.');
		return event.answer();
	}

	// Голосуем
	poll.options[option].votes++;
	poll.usersVoted[event.payload.from.userId] = true;

	// Отправляем уведомление пользвоателю
	event.replyData.text('Вы успешно проголосовали!');
	event.answer();
});

// Выводим ошибки в консоль
sdk.on('error', (error) => {
	console.error(error);
});


// Запускаем поллинг событий
sdk.listen();
