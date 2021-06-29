import {MyTeamServerMock} from "./MyTeamServerMock";
import {
	MyTeamSDK,
	MyTeamSDKError,
	URLBuilder,
	MessageBuilder,
	MyTeamEditedMessageEvent,
	MyTeamNewMessageEvent,
} from "../src";
import {getEditedMessageEvent, getNewMessageEvent} from "./fixtures";
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
});