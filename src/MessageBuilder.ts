import {isString, MyTeamFormat} from "./types";

interface MyTeamBaseButton {
	text: string;
	style: 'attention' | 'primary' | 'secondary';
}

export type MyTeamButton = MyTeamBaseButton & (
	{
		url: string;
	} | {
		callbackData: string;
	}
);

export function escapeHTML(unsafe: string) {
	return unsafe
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

export class MessageBuilder {
	public textValue: string = '';
	public replyMsgId: string[] = [];
	public forwardChatId?: string;
	public forwardMsgId: string[] = [];
	public inlineKeyboardMarkup?: MyTeamButton[][];
	public format?: Partial<MyTeamFormat>;
	public parseMode?: string;

	text(value: string): this {
		this.textValue = value;
		return this;
	}

	replyTo(msgId: string): this {
		this.replyMsgId.push(msgId);
		this.forwardChatId = undefined;
		this.forwardMsgId = [];
		return this;
	}

	forwardFrom(msgId: string, chatId: string): this {
		this.replyMsgId = [];

		if (this.forwardChatId !== chatId) {
			this.forwardMsgId = [];
		}

		this.forwardChatId = chatId;
		this.forwardMsgId.push(msgId)
		return this;
	}

	buttonRow(): this {
		if (!this.inlineKeyboardMarkup) {
			this.inlineKeyboardMarkup = [[]];
		} else {
			this.inlineKeyboardMarkup.push([]);
		}

		return this;
	}

	button(button: MyTeamButton): this {
		if (!this.inlineKeyboardMarkup) {
			this.buttonRow();
		}

		const row = this.inlineKeyboardMarkup[this.inlineKeyboardMarkup.length - 1] as any as MyTeamButton[];
		row.push(button);

		return this;
	}

	formatText(type: keyof MyTeamFormat | 'none', value: string) {
		if (type === 'none') {
			this.textValue += value;
			return this;
		}

		if (this.parseMode) {
			this.textValue = '';
		}

		const offset = this.textValue.length;
		const length = value.length;

		this.textValue += value;

		return this.formatRange(type, {
			offset,
			length,
		});
	}

	formatRange(type: keyof MyTeamFormat, value: MyTeamFormat[typeof type][0]): this {
		this.parseMode = undefined;
		this.format = this.format ?? {};

		this.format[type] = (this.format[type] ?? []) as any;
		(this.format[type] as any).push(value as any);

		return this;
	}

	markdown(value: string): this {
		this.format = undefined;
		this.parseMode = 'MarkdownV2';
		this.textValue = value;
		return this;
	}

	html(value: string): this {
		this.format = undefined;
		this.parseMode = 'HTML';
		this.textValue = value;
		return this;
	}

	toObject(): Record<string, string> {
		const result: Record<string, string> = {
			text: this.textValue,
		};

		if (this.replyMsgId.length) {
			result.replyMsgId = this.replyMsgId.join(',');
		} else if (this.forwardMsgId.length && isString(this.forwardChatId)) {
			result.forwardChatId = this.forwardChatId;
			result.forwardMsgId = this.forwardMsgId.join(',');
		}

		if (this.inlineKeyboardMarkup) {
			result.inlineKeyboardMarkup = JSON.stringify(this.inlineKeyboardMarkup);
		}

		if (this.format) {
			result.format = JSON.stringify(this.format);
		} else if (isString(this.parseMode)) {
			result.parseMode = this.parseMode;
		}

		return result;
	}
}
