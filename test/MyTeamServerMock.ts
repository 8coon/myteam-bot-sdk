import * as http from "http";
import {MyTeamAnyEvent} from "../src/types";

export class MyTeamServerMock {
	private readonly _server: http.Server;
	private readonly _events: Record<string, MyTeamAnyEvent> = {};
	private _lastEventId: number = 0;
	private _lastSeenId: number = -1;
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

	sendEvent<T extends MyTeamAnyEvent = MyTeamAnyEvent>(event: T & {eventId: never}) {
		const eventWithId: T = {
			...event,
			eventId: this._lastEventId++,
		};

		this._events[eventWithId.eventId] = eventWithId;
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

		switch (url.pathname) {
			case '/events/get':
				this._handleEventsGet(url, response);
				break;

			default:
				response.write(JSON.stringify({ok: false}), () => {
					response.end();
				});
				break;
		}
	}

	private _handleEventsGet(url: URL, response: http.ServerResponse) {
		this._lastToken = url.searchParams.get('token');

		response.write(JSON.stringify({ok: true}), () => {
			response.end();
		});
	}
}
