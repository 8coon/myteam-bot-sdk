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
});
