import * as EventEmitter from 'events';
import fetch, {Response} from 'node-fetch';
import {URLBuilder} from './URLBuilder';
import {
	isMyTeamCallbackQueryEvent, isMyTeamEditedMessageEvent,
	isMyTeamNewMessageEvent,
	MyTeamAnyEvent,
	MyTeamCallbackQueryEvent,
	MyTeamDeletedMessageEvent,
	MyTeamEditedMessageEvent,
	MyTeamLeftChatMembersEvent,
	MyTeamNewChatMembersEvent,
	MyTeamNewMessageEvent,
	MyTeamPinnedMessageEvent,
	MyTeamUnpinnedMessageEvent,
} from './types';
import {MessageBuilder, escapeHtml} from "./MessageBuilder";
import {CallbackQueryAnswerBuilder} from "./CallbackQueryAnswerBuilder";

export interface MyTeamOptions {
	baseURL: string;
	token: string;
	pollTime: number;
}

export interface MyTeamCommandContext {
	sdk: MyTeamSDK;
	command: string;
	args: string;
	event: MyTeamNewMessageEvent | MyTeamEditedMessageEvent;
}

export interface MyTeamMember {
	userId: string;
	creator?: boolean;
	admin?: boolean;
}

export type MyTeamCommandHandler = (context: MyTeamCommandContext) => void;

const R_COMMAND = /^\/\w+/gu;

function readCommand(source: unknown): string | undefined {
	if (typeof source !== 'string') {
		return undefined;
	}

	const matchResult = source.match(R_COMMAND);

	if (matchResult == null) {
		return undefined;
	}

	return matchResult[0];
}

class MyTeamSDKError extends Error {
	constructor(description: string, public readonly serverResponse: any) {
		super((description ?? 'Unknown MyTeam API Error') + ' : ' + JSON.stringify(serverResponse));
	}
}

class MyTeamCallbackQueryEventEx implements MyTeamCallbackQueryEvent {
	type = 'callbackQuery' as const;

	public readonly replyData = new CallbackQueryAnswerBuilder();

	constructor(
		private _sdk: MyTeamSDK,
		public eventId: number,
		public payload: MyTeamCallbackQueryEvent["payload"]
	) {}

	answer() {
		return this._sdk.answerCallbackQuery(this.payload.queryId, this.replyData);
	}
}

class MyTeamSDK extends EventEmitter {
	private readonly _options: MyTeamOptions;
	private _running: boolean = false;
	private _lastEventId: number = 0;

	constructor(options: Partial<MyTeamOptions> & {token: string}) {
		super();

		const defaultOptions: MyTeamOptions = {
			baseURL: 'https://myteam.mail.ru/bot/v1/',
			token: options.token,
			pollTime: 30,
		}

		this._options = {
			...defaultOptions,
			...options,
		}
	}

	listen() {
		this._running = true;
		this._mainLoop();
		return this;
	}

	stop() {
		this._running = false;
		return this;
	}

	addCommand(aliases: string | string[], handler: MyTeamCommandHandler) {
		aliases = Array.isArray(aliases) ? aliases : [aliases];

		for (const alias of aliases) {
			this.on(`command:${alias}`, handler);
		}
	}

	on(event: 'newMessage', handler: (event: MyTeamNewMessageEvent) => void): this
	on(event: 'editedMessage', handler: (event: MyTeamEditedMessageEvent) => void): this
	on(event: 'deletedMessage', handler: (event: MyTeamDeletedMessageEvent) => void): this
	on(event: 'pinnedMessage', handler: (event: MyTeamPinnedMessageEvent) => void): this
	on(event: 'unpinnedMessage', handler: (event: MyTeamUnpinnedMessageEvent) => void): this
	on(event: 'newChatMembers', handler: (event: MyTeamNewChatMembersEvent) => void): this
	on(event: 'leftChatMembers', handler: (event: MyTeamLeftChatMembersEvent) => void): this
	on(event: 'callbackQuery', handler: (event: MyTeamCallbackQueryEventEx) => void): this
	on(event: 'error', handler: (error: unknown) => void): this
	on(event: string, handler: (...args: any[]) => void): this
	on(event: string, handler: (event: any) => void): this {
		return super.on(event, handler);
	}

	sendText(chatId: string, text: string | MessageBuilder): Promise<string> {
		const message = text instanceof MessageBuilder
			? text
			: new MessageBuilder().text(text);

		return fetch(
			new URLBuilder('messages/sendText', this._options.baseURL)
				.appendQuery('token', this._options.token)
				.appendQuery('chatId', chatId)
				.appendQueryObject(message.toObject())
				.toString(),
		).then(this._handleSDKResponse).then((json) => {
			if (typeof json.msgId !== 'string') {
				throw new MyTeamSDKError('Bad sendText response', {
					raw: json,
				});
			}

			return json.msgId;
		});
	}

	editText(chatId: string, msgId: string, text: string | MessageBuilder) {
		const message = text instanceof MessageBuilder
			? text
			: new MessageBuilder().text(text);

		return fetch(
			new URLBuilder('messages/editText', this._options.baseURL)
				.appendQuery('token', this._options.token)
				.appendQuery('chatId', chatId)
				.appendQuery('msgId', msgId)
				.appendQueryObject(message.toObject())
				.toString(),
		).then(this._handleSDKResponse);
	}

	getMembers(chatId: string, query?: string, cursor?: string): Promise<MyTeamMember[]> {
		return fetch(
			new URLBuilder('chats/getMembers', this._options.baseURL)
				.appendQuery('token', this._options.token)
				.appendQuery('chatId', chatId)
				.appendQueryIfTruthy('query', query)
				.appendQueryIfTruthy('cursor', cursor)
				.toString(),
		).then(this._handleSDKResponse).then((json) => {
			if (Array.isArray(json.members)) {
				return json.members;
			}

			return [];
		})
	}

	answerCallbackQuery(queryId: string, text?: string | CallbackQueryAnswerBuilder) {
		const answer = text instanceof CallbackQueryAnswerBuilder
			? text
			: (text ? new CallbackQueryAnswerBuilder().text(text) : new CallbackQueryAnswerBuilder());

		return fetch(
			new URLBuilder('messages/answerCallbackQuery', this._options.baseURL)
				.appendQuery('token', this._options.token)
				.appendQuery('queryId', queryId)
				.appendQueryObject(answer.toObject())
				.toString(),
		).then(this._handleSDKResponse);
	}

	private _handleSDKResponse = (result: Response) => {
		return Promise
			.all([Promise.resolve(result), result.json()])
			.then(([result, json]) => {
				if (json.ok) {
					return json;
				}

				throw new MyTeamSDKError(json.description, {
					raw: json,
					url: result.url,
				});
			});
	}

	private _handleCommand(event: MyTeamNewMessageEvent | MyTeamEditedMessageEvent) {
		const command = readCommand(event.payload.text);

		if (typeof command !== 'string' || !command.length) {
			return;
		}

		const args = event.payload.text.slice(command.length).trim();

		const context: MyTeamCommandContext = {
			sdk: this,
			command,
			args,
			event,
		}

		this.emit(`command:${command}`, context);
	}

	private async _mainLoop() {
		while (this._running) {
			try {
				await this._mainLoopIter();
			} catch (error) {
				this.emit('error', error);
			}
		}
	}

	private async _mainLoopIter() {
		const response = await fetch(
			new URLBuilder('events/get', this._options.baseURL)
				.appendQuery('token', this._options.token)
				.appendQuery('lastEventId', this._lastEventId)
				.appendQuery('pollTime', this._options.pollTime)
				.toString(),
		);

		const json: { events: MyTeamAnyEvent[] } = await response.json();

		// Эмитим события для всего, что пришло от сервера
		for (let event of json.events) {
			this._lastEventId = event.eventId;

			if (isMyTeamCallbackQueryEvent(event)) {
				event = new MyTeamCallbackQueryEventEx(this, event.eventId, event.payload);
			} else if (isMyTeamNewMessageEvent(event) || isMyTeamEditedMessageEvent(event)) {
				this._handleCommand(event);
			}

			try {
				this.emit(event.type, event);
			} catch (error) {
				this.emit('error', error);
			}
		}
	}
}

export {
	MyTeamSDK,
	MyTeamSDKError,
	URLBuilder,
	MessageBuilder,
	MyTeamCallbackQueryEventEx,
	escapeHtml,
}
