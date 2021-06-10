export interface MyTeamChat {
	chatId: string;
	type: 'private' | 'group';
	title: string;
}

export interface MyTeamUser {
	userId: string;
	firstName: string;
	lastName: string;
}

export interface MyTeamFormattedText {
	offset: number;
	length: number;
}

export interface MyTeamLink extends MyTeamFormattedText {
	url: string;
}

export interface MyTeamCode extends MyTeamFormattedText {
	code: string;
}

export interface MyTeamFormat {
	bold: MyTeamFormattedText[];
	italic: MyTeamFormattedText[];
	underline: MyTeamFormattedText[];
	strikethrough: MyTeamFormattedText[];
	link: MyTeamLink[];
	mention: MyTeamFormattedText[];
	inline_code: MyTeamFormattedText[];
	pre: MyTeamCode[];
	ordered_list: MyTeamFormattedText[];
	unordered_list: MyTeamFormattedText[];
	quote: MyTeamFormattedText[];
}

export interface MyTeamPart<T extends string, P extends Record<any, any>> {
	type: T;
	payload: P;
}

export interface MyTeamAnyPart extends MyTeamPart<any, any> {}

export interface MyTeamPartDefaultPayload {
	field: string;
}

export interface MyTeamPartFilePayload extends MyTeamPartDefaultPayload {
	type: string;
	caption: string;
	format: MyTeamFormat;
}

export interface MyTeamMessage {
	from: MyTeamUser;
	msgId: string;
	text: string;
	format?: MyTeamFormat;
	timestamp: number;
}

export interface MyTeamStickerPart extends MyTeamPart<'sticker', MyTeamPartDefaultPayload> {}
export function isMyTeamStickerPart(part: MyTeamAnyPart): part is MyTeamStickerPart {
	return part.type === 'sticker';
}

export interface MyTeamMentionPart extends MyTeamPart<'mention', MyTeamUser> {}
export function isMyTeamMentionPart(part: MyTeamAnyPart): part is MyTeamMentionPart {
	return part.type === 'mention';
}

export interface MyTeamVoicePart extends MyTeamPart<'voice', MyTeamPartDefaultPayload> {}
export function isMyTeamVoicePart(part: MyTeamAnyPart): part is MyTeamVoicePart {
	return part.type === 'voice';
}

export interface MyTeamFilePart extends MyTeamPart<'file', MyTeamPartFilePayload> {}
export function isMyTeamFilePart(part: MyTeamAnyPart): part is MyTeamFilePart {
	return part.type === 'file';
}

export interface MyTeamForwardPart extends MyTeamPart<'forward', MyTeamMessage> {}
export function isMyTeamForwardPart(part: MyTeamAnyPart): part is MyTeamForwardPart {
	return part.type === 'forward';
}

export interface MyTeamReplyPart extends MyTeamPart<'reply', MyTeamMessage> {}
export function isMyTeamReplyPart(part: MyTeamAnyPart): part is MyTeamReplyPart {
	return part.type === 'reply';
}

export interface MyTeamEvent<T extends string, P extends Record<any, any>> {
	eventId: number;
	type: T;
	payload: P;
}

export interface MyTeamAnyEvent extends MyTeamEvent<any, any> {}

export interface MyTeamNewMessageEvent extends MyTeamEvent<'newMessage', MyTeamMessage & {
	chat: MyTeamChat;
	parts: (MyTeamAnyPart | null)[];
}> {}
export function isMyTeamNewMessageEvent(event: MyTeamAnyEvent): event is MyTeamNewMessageEvent {
	return event.type === 'newMessage';
}

export interface MyTeamEditedMessageEvent extends MyTeamEvent<'editedMessage', MyTeamMessage & {
	chat: MyTeamChat;
	editedTimestamp: number;
}> {}
export function isMyTeamEditedMessageEvent(event: MyTeamAnyEvent): event is MyTeamEditedMessageEvent {
	return event.type === 'editedMessage';
}

export interface MyTeamDeletedMessageEvent extends MyTeamEvent<'deletedMessage', {
	msgId: string;
	chat: MyTeamChat;
	timestamp: number;
}> {}
export function isMyTeamDeletedMessageEvent(event: MyTeamAnyEvent): event is MyTeamDeletedMessageEvent {
	return event.type === 'deletedMessage';
}

export interface MyTeamPinnedMessageEvent extends MyTeamEvent<'pinnedMessage', MyTeamMessage & {
	chat: MyTeamChat;
}> {}
export function isMyTeamPinnedMessageEvent(event: MyTeamAnyEvent): event is MyTeamPinnedMessageEvent {
	return event.type === 'pinnedMessage';
}

export interface MyTeamUnpinnedMessageEvent extends MyTeamEvent<'unpinnedMessage', {
	msgId: string;
	chat: MyTeamChat;
	timestamp: number;
}> {}
export function isMyTeamUnpinnedMessageEvent(event: MyTeamAnyEvent): event is MyTeamUnpinnedMessageEvent {
	return event.type === 'unpinnedMessage';
}

export interface MyTeamNewChatMembersEvent extends MyTeamEvent<'newChatMembers', {
	chat: MyTeamChat;
	newMembers: MyTeamUser[];
	addedBy: MyTeamUser;
	timestamp: number;
}> {}
export function isMyTeamNewChatMembersEvent(event: MyTeamAnyEvent): event is MyTeamNewChatMembersEvent {
	return event.type === 'newChatMembers';
}

export interface MyTeamLeftChatMembersEvent extends MyTeamEvent<'leftChatMembers', {
	chat: MyTeamChat;
	newMembers: MyTeamUser[];
	removedBy: MyTeamUser;
	timestamp: number;
}> {}
export function isMyTeamLeftChatMembersEvent(event: MyTeamAnyEvent): event is MyTeamLeftChatMembersEvent {
	return event.type === 'leftChatMembers';
}

export interface MyTeamCallbackQueryEvent extends MyTeamEvent<'callbackQuery', {
	queryId: string;
	from: MyTeamUser;
	message: MyTeamNewMessageEvent["payload"];
	callbackData: string;
}> {}
export function isMyTeamCallbackQueryEvent(event: MyTeamAnyEvent): event is MyTeamCallbackQueryEvent {
	return event.type === 'callbackQuery';
}

export function isString(a: unknown): a is string {
	return typeof a === 'string';
}
