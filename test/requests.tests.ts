import {MyTeamServerMock} from "./MyTeamServerMock";
import {MyTeamSDK, MyTeamSDKError} from "../src";

const port = 6666;
const token = '123';

describe('requests', () => {
	let server: MyTeamServerMock;
	const sdk = new MyTeamSDK({
		token,
		baseURL: `http://localhost:${port}`,
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
		await expect(sdk.get('events/get')).resolves.toBeTruthy();
		expect(server.lastToken).toEqual(token);
	});

	test('SDK sends token to each POST request', async () => {
		await expect(sdk.post('test', 'some body')).rejects.toEqual(
			new MyTeamSDKError(undefined, {
				raw: {ok: false},
				url: `http://localhost:6666/test?token=${token}`,
			}),
		);
		expect(server.lastToken).toEqual(token);
	});
});
