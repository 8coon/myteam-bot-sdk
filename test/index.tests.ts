import {MyTeamServerMock} from "./MyTeamServerMock";
import {
	MyTeamSDK,
	MyTeamSDKError,
	URLBuilder,
	MessageBuilder,
	CallbackQueryAnswerBuilder,
	MyTeamEditedMessageEvent,
	MyTeamNewMessageEvent, MyTeamCallbackQueryEvent, MyTeamCallbackQueryEventEx,
} from "../src";
import {getCallbackQueryEvent, getEditedMessageEvent, getNewMessageEvent} from "./fixtures";
import {sleep} from "./sleep";

const port = 6666;
const baseURL = `http://localhost:${port}`;
const token = '123';
const pollTime = 50;

describe('index', () => {
	let server: MyTeamServerMock;
	let sdk: MyTeamSDK;
	let handleError: jest.MockedFunction<any>;

	beforeEach(() => {
		sdk = new MyTeamSDK({
			token,
			baseURL,
			pollTime,
		});

		handleError = jest.fn();
		sdk.on('error', handleError);

		server = new MyTeamServerMock();
		return server.listen(6666);
	});

	afterEach(() => {
		sdk.stop();
		return server.stop();
	});

	test('SDK sends token to each GET request', async () => {
		await expect(sdk.get(new URLBuilder('events/get', baseURL))).resolves.toBeTruthy();
		expect(server.lastToken).toEqual(token);
	});

	test('SDK sends token to each POST request', async () => {
		await expect(sdk.post(new URLBuilder('test', baseURL), 'some body')).rejects.toEqual(
			new MyTeamSDKError(undefined, {
				raw: {ok: false},
				url: `http://localhost:6666/test?token=${token}`,
			}),
		);
		expect(server.lastToken).toEqual(token);
	});

	test('SDK accepts string as POST url', async () => {
		await expect(sdk.post('test', 'some body')).rejects.toEqual(
			new MyTeamSDKError(undefined, {
				raw: {ok: false},
				url: `http://localhost:6666/test?token=${token}`,
			}),
		);
	});

	test('get events', async () => {
		const newMessageHandler = jest.fn();
		sdk.on('newMessage', newMessageHandler);
		sdk.listen();

		const event = getNewMessageEvent();
		server.sendEvent<MyTeamNewMessageEvent>(event);

		await sleep(pollTime * 3);

		expect(newMessageHandler).toHaveBeenCalledTimes(1);
		expect(newMessageHandler).toHaveBeenCalledWith({...event, eventId: expect.any(Number)});
	});

	test('command', async () => {
		const commandHandler = jest.fn();
		sdk.addCommand('/test', commandHandler);
		sdk.listen();

		const event = getNewMessageEvent('/test this is arguments');
		server.sendEvent<MyTeamNewMessageEvent>(event);

		await sleep(pollTime * 3);

		expect(commandHandler).toHaveBeenCalledTimes(1);
		expect(commandHandler).toHaveBeenCalledWith({
			args: 'this is arguments',
			command: '/test',
			event: {...event, eventId: 2},
			sdk,
		});
	});

	test('command with an alias and no arguments', async () => {
		const commandHandler = jest.fn();
		sdk.addCommand(['/test', '/a'], commandHandler);
		sdk.listen();

		const event = getNewMessageEvent('/a');
		server.sendEvent<MyTeamNewMessageEvent>(event);

		await sleep(pollTime * 3);

		expect(commandHandler).toHaveBeenCalledTimes(1);
		expect(commandHandler).toHaveBeenCalledWith({
			args: '',
			command: '/a',
			event: {...event, eventId: 2},
			sdk,
		});
	});

	test('malformed command from edit event', async () => {
		sdk.listen();

		const event = getEditedMessageEvent({} as any);
		server.sendEvent<MyTeamEditedMessageEvent>(event);

		await sleep(pollTime * 3);

		expect(handleError).toHaveBeenCalledTimes(0);
	});

	test('sendText', async () => {
		await expect(
			sdk.sendText('1@chat', new MessageBuilder()
				.text('valid'))
		).resolves.toEqual('1');
	});

	test('sendText error', async () => {
		await expect(
			sdk.sendText('1', 'invalid')
		).rejects.toEqual(
			new MyTeamSDKError('Invalid text', {
				raw: {ok: false, description: 'Invalid text'},
				url: `http://localhost:6666/messages/sendText?chatId=1&text=invalid&token=${token}`,
			}),
		);
	});

	test('sendText malformed response', async () => {
		await expect(
			sdk.sendText('1', 'malformed')
		).rejects.toEqual(
			new MyTeamSDKError('Bad sendText response', {raw: {ok: true}}),
		);
	});

	test('editText', async () => {
		await expect(
			sdk.editText('1chat', '1', 'invalid')
		).rejects.toEqual(
			new MyTeamSDKError('Message not found', {
				raw: {ok: false, description: 'Message not found'},
				url: `http://localhost:6666/messages/editText?chatId=1chat&msgId=1&text=invalid&token=${token}`,
			}),
		);
	});

	test('editText accepts MessageBuilder', async () => {
		await expect(
			sdk.editText('1chat', '1', new MessageBuilder().text('invalid'))
		).rejects.toEqual(
			new MyTeamSDKError('Message not found', {
				raw: {ok: false, description: 'Message not found'},
				url: `http://localhost:6666/messages/editText?chatId=1chat&msgId=1&text=invalid&token=${token}`,
			}),
		);
	});

	test('getMembers', async () => {
		await expect(
			sdk.getMembers('1')
		).resolves.toEqual([{userId: '1@user', firstName: 'User', lastName: 'Name', role: 'admin'}]);
	});

	test('getMembers empty', async () => {
		await expect(
			sdk.getMembers('empty')
		).resolves.toEqual([]);
	});

	test('getMembers with query', async () => {
		await expect(
			sdk.getMembers('2', 'q')
		).rejects.toEqual(
			new MyTeamSDKError(undefined, {
				raw: {ok: false},
				url: `http://localhost:6666/chats/getMembers?chatId=2&query=q&token=${token}`,
			}),
		);
	});

	test('getMembers with query and cursor', async () => {
		await expect(
			sdk.getMembers('2', 'q', 'c')
		).rejects.toEqual(
			new MyTeamSDKError(undefined, {
				raw: {ok: false},
				url: `http://localhost:6666/chats/getMembers?chatId=2&query=q&cursor=c&token=${token}`,
			}),
		);
	});

	test('answerCallbackQuery', async () => {
		const handleAnswer = jest.fn();
		server.requestCallbackQuery('1', handleAnswer);

		await expect(sdk.answerCallbackQuery('1')).resolves.toBeTruthy();

		expect(handleAnswer).toHaveBeenCalledWith(
			`http://localhost/messages/answerCallbackQuery?queryId=1&token=${token}`
		);
	});

	test('answerCallbackQuery with string', async () => {
		const handleAnswer = jest.fn();
		server.requestCallbackQuery('1', handleAnswer);

		await expect(sdk.answerCallbackQuery('1', 'click')).resolves.toBeTruthy();

		expect(handleAnswer).toHaveBeenCalledWith(
			`http://localhost/messages/answerCallbackQuery?queryId=1&text=click&token=${token}`
		);
	});

	test('answerCallbackQuery with builder', async () => {
		const handleAnswer = jest.fn();
		server.requestCallbackQuery('1', handleAnswer);

		await expect(sdk.answerCallbackQuery('1',
			new CallbackQueryAnswerBuilder().alert('click'),
		)).resolves.toBeTruthy();

		expect(handleAnswer).toHaveBeenCalledWith(
			`http://localhost/messages/answerCallbackQuery?queryId=1&text=click&showAlert=true&token=${token}`
		);
	});

	test('callbackQuery event', async () => {
		sdk.listen();

		const handleQuery = jest.fn((event: MyTeamCallbackQueryEventEx) => {
			if (event.payload.queryId === '1') {
				event.replyData.alert('click');
				event.answer();
			}
		});

		const handleAnswer = jest.fn();

		sdk.on('callbackQuery', handleQuery);
		server.requestCallbackQuery('1', handleAnswer);

		const event = getCallbackQueryEvent('1');
		server.sendEvent<MyTeamCallbackQueryEvent>(event);

		await sleep(pollTime * 3);

		const expectedEvent = new MyTeamCallbackQueryEventEx(sdk, 2, event.payload);
		expectedEvent.replyData.alert('click');

		expect(handleQuery).toHaveBeenCalledWith(expectedEvent);
		expect(handleAnswer).toHaveBeenCalledWith(
			`http://localhost/messages/answerCallbackQuery?queryId=1&text=click&showAlert=true&token=${token}`
		);
	});

	test('send custom event', async () => {
		const eventHandler = jest.fn();
		sdk.on('customEvent', eventHandler);
		sdk.listen();

		const event = {type: 'customEvent', payload: {}};
		server.sendEvent(event);

		await sleep(pollTime * 3);

		expect(eventHandler).toHaveBeenCalledWith({...event, eventId: 2});
	});
});
