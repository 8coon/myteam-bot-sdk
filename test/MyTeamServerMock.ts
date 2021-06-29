import * as http from "http";
import {MyTeamAnyEvent} from "../src/types";
import {sleep} from "./sleep";

export class MyTeamServerMock {
	private readonly _server: http.Server;
	private readonly _events: Record<string, MyTeamAnyEvent> = {};
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
				this._lastToken = url.searchParams.get('token');
				response.write(JSON.stringify({ok: false}), () => {
					response.end();
				});
				break;
		}
	}

	private _handleEventsGet(url: URL, response: http.ServerResponse) {
		this._lastToken = url.searchParams.get('token');
		this._lastSeenId = Math.max(parseInt(url.searchParams.get('lastEventId')), this._lastSeenId);
		const pollTime = parseInt(url.searchParams.get('pollTime'));

		response.writeHead(200, {
			'content-type': 'application/json',
		});

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
}
