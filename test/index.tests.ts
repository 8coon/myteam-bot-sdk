import {MyTeamServerMock} from "./MyTeamServerMock";
import {MyTeamSDK, MyTeamSDKError, URLBuilder} from "../src";
import {MyTeamNewMessageEvent} from "../src/types";
import {getNewMessageEvent} from "./fixtures";
import {sleep} from "./sleep";

const port = 6666;
const baseURL = `http://localhost:${port}`;
const token = '123';
const pollTime = 50;

describe('index', () => {
	let server: MyTeamServerMock;
	const sdk = new MyTeamSDK({
		token,
		baseURL,
		pollTime,
	});

	beforeEach(() => {
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
});
