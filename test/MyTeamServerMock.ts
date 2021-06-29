import * as http from "http";
import {MyTeamAnyEvent} from "../src/types";
import {sleep} from "./sleep";

export class MyTeamServerMock {
	private readonly _server: http.Server;
	private readonly _events: Record<string, MyTeamAnyEvent> = {};
	private readonly _callbacks: Record<string, (url: string) => void> = {};
	private _lastEventId: number = 1;
	private _lastSeenId: number = 1;
	private _lastToken?: string;

	get lastToken() {
		return this._lastToken;
	}

	constructor() {
		this._server = http.createServer(this._handleRequest);
	}

	listen(port: number) {
		return new Promise((resolve) => {
			this._server.listen(port, () => resolve(undefined));
		});
	}

	sendEvent<T extends MyTeamAnyEvent = MyTeamAnyEvent>(event: Omit<T, 'eventId'>) {
		const eventWithId: MyTeamAnyEvent = {
			...event,
			eventId: ++this._lastEventId,
		};

		this._events[eventWithId.eventId] = eventWithId;
	}

	requestCallbackQuery(queryId: string, onAnswer: (url: string) => void) {
		this._callbacks[queryId] = onAnswer;
	}

	stop() {
		return new Promise((resolve, reject) => {
			this._server.close((err) => {
				if (err) {
					reject(err);
				} else {
					resolve(undefined);
				}
			});
		});
	}

	private _handleRequest = (request: http.IncomingMessage, response: http.ServerResponse) => {
		const url = new URL(request.url, 'http://localhost');
		this._lastToken = url.searchParams.get('token');

		switch (url.pathname) {
			case '/events/get':
				this._handleEventsGet(url, response);
				break;

			case '/messages/sendText':
				this._handleSendText(url, response);
				break;

			case '/messages/editText':
				this._handleEditText(url, response);
				break;

			case '/chats/getMembers':
				this._handleGetMembers(url, response);
				break;

			case '/messages/answerCallbackQuery':
				this._handleAnswerCallbackQuery(url, response);
				break;

			default:
				response.write(JSON.stringify({ok: false}), () => {
					response.end();
				});
				break;
		}
	}

	private _handleEventsGet(url: URL, response: http.ServerResponse) {
		this._lastSeenId = Math.max(parseInt(url.searchParams.get('lastEventId')), this._lastSeenId);
		const pollTime = parseInt(url.searchParams.get('pollTime'));

		const events: MyTeamAnyEvent[] = [];

		for (const event of Object.values(this._events)) {
			if (event.eventId > this._lastSeenId) {
				events.push(event);
				this._lastSeenId = event.eventId;
			}
		}

		const promise = events.length
			? Promise.resolve()
			: sleep(pollTime);

		response.write(JSON.stringify({
			ok: true,
			events,
		}), () => {
			promise.then(() => {
				response.end();
			});
		});
	}

	private _handleSendText(url: URL, response: http.ServerResponse) {
		const result = (() => {
			switch (url.searchParams.get('text')) {
				case 'invalid': return {ok: false, description: 'Invalid text'};
				case 'malformed': return {ok: true};
				default: return {ok: true, msgId: '1'};
			}
		})();

		response.write(JSON.stringify(result), () => {
			response.end();
		});
	}

	private _handleEditText(url: URL, response: http.ServerResponse) {
		response.write(JSON.stringify({ok: false, description: 'Message not found'}), () => {
			response.end();
		});
	}

	private _handleGetMembers(url: URL, response: http.ServerResponse) {
		const result = (() => {
			switch (url.searchParams.get('chatId')) {
				case 'empty': return {ok: true};
				case '1': return {ok: true, members: [{userId: '1@user', firstName: 'User', lastName: 'Name', role: 'admin'}]};
				default: return {ok: false};
			}
		})();

		response.write(JSON.stringify(result), () => {
			response.end();
		});
	}

	private _handleAnswerCallbackQuery(url: URL, response: http.ServerResponse) {
		response.write(JSON.stringify({ok: true}), () => {
			response.end();

			const queryId = url.searchParams.get('queryId');
			const callback = this._callbacks[queryId];
			delete this._callbacks[queryId];
			callback(url.toString());
		});
	}
}
