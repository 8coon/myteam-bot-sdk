import {
	isMyTeamStickerPart,
	isMyTeamMentionPart,
	isMyTeamVoicePart,
	isMyTeamFilePart,
	isMyTeamForwardPart,
	isMyTeamReplyPart,
	isMyTeamNewMessageEvent,
	isMyTeamEditedMessageEvent,
	isMyTeamDeletedMessageEvent,
	isMyTeamPinnedMessageEvent,
	isMyTeamUnpinnedMessageEvent,
	isMyTeamNewChatMembersEvent,
	isMyTeamLeftChatMembersEvent,
	isMyTeamCallbackQueryEvent,
	isString,
} from "../src";

describe('types', () => {
	test('isMyTeamStickerPart false', () => {
		expect(isMyTeamStickerPart({type: '', payload: {}})).toBeFalsy();
	});

	test('isMyTeamStickerPart true', () => {
		expect(isMyTeamStickerPart({type: 'sticker', payload: {}})).toBeTruthy();
	});

	test('isMyTeamMentionPart false', () => {
		expect(isMyTeamMentionPart({type: '', payload: {}})).toBeFalsy();
	});

	test('isMyTeamMentionPart true', () => {
		expect(isMyTeamMentionPart({type: 'mention', payload: {}})).toBeTruthy();
	});

	test('isMyTeamVoicePart false', () => {
		expect(isMyTeamVoicePart({type: '', payload: {}})).toBeFalsy();
	});

	test('isMyTeamVoicePart true', () => {
		expect(isMyTeamVoicePart({type: 'voice', payload: {}})).toBeTruthy();
	});

	test('isMyTeamFilePart false', () => {
		expect(isMyTeamFilePart({type: '', payload: {}})).toBeFalsy();
	});

	test('isMyTeamFilePart true', () => {
		expect(isMyTeamFilePart({type: 'file', payload: {}})).toBeTruthy();
	});

	test('isMyTeamForwardPart false', () => {
		expect(isMyTeamForwardPart({type: '', payload: {}})).toBeFalsy();
	});

	test('isMyTeamForwardPart true', () => {
		expect(isMyTeamForwardPart({type: 'forward', payload: {}})).toBeTruthy();
	});

	test('isMyTeamReplyPart false', () => {
		expect(isMyTeamReplyPart({type: '', payload: {}})).toBeFalsy();
	});

	test('isMyTeamReplyPart true', () => {
		expect(isMyTeamReplyPart({type: 'reply', payload: {}})).toBeTruthy();
	});

	test('isMyTeamNewMessageEvent false', () => {
		expect(isMyTeamNewMessageEvent({type: '', payload: {}, eventId: 1})).toBeFalsy();
	});

	test('MyTeamNewMessageEvent true', () => {
		expect(isMyTeamNewMessageEvent({type: 'newMessage', payload: {}, eventId: 1})).toBeTruthy();
	});

	test('isMyTeamEditedMessageEvent false', () => {
		expect(isMyTeamEditedMessageEvent({type: '', payload: {}, eventId: 1})).toBeFalsy();
	});

	test('isMyTeamEditedMessageEvent true', () => {
		expect(isMyTeamEditedMessageEvent({type: 'editedMessage', payload: {}, eventId: 1})).toBeTruthy();
	});

	test('isMyTeamDeletedMessageEvent false', () => {
		expect(isMyTeamDeletedMessageEvent({type: '', payload: {}, eventId: 1})).toBeFalsy();
	});

	test('isMyTeamDeletedMessageEvent true', () => {
		expect(isMyTeamDeletedMessageEvent({type: 'deletedMessage', payload: {}, eventId: 1})).toBeTruthy();
	});

	test('isMyTeamPinnedMessageEvent false', () => {
		expect(isMyTeamPinnedMessageEvent({type: '', payload: {}, eventId: 1})).toBeFalsy();
	});

	test('isMyTeamPinnedMessageEvent true', () => {
		expect(isMyTeamPinnedMessageEvent({type: 'pinnedMessage', payload: {}, eventId: 1})).toBeTruthy();
	});

	test('isMyTeamUnpinnedMessageEvent false', () => {
		expect(isMyTeamUnpinnedMessageEvent({type: '', payload: {}, eventId: 1})).toBeFalsy();
	});

	test('isMyTeamUnpinnedMessageEvent true', () => {
		expect(isMyTeamUnpinnedMessageEvent({type: 'unpinnedMessage', payload: {}, eventId: 1})).toBeTruthy();
	});

	test('isMyTeamNewChatMembersEvent false', () => {
		expect(isMyTeamNewChatMembersEvent({type: '', payload: {}, eventId: 1})).toBeFalsy();
	});

	test('isMyTeamNewChatMembersEvent true', () => {
		expect(isMyTeamNewChatMembersEvent({type: 'newChatMembers', payload: {}, eventId: 1})).toBeTruthy();
	});

	test('isMyTeamLeftChatMembersEvent false', () => {
		expect(isMyTeamLeftChatMembersEvent({type: '', payload: {}, eventId: 1})).toBeFalsy();
	});

	test('isMyTeamLeftChatMembersEvent true', () => {
		expect(isMyTeamLeftChatMembersEvent({type: 'leftChatMembers', payload: {}, eventId: 1})).toBeTruthy();
	});

	test('isMyTeamCallbackQueryEvent false', () => {
		expect(isMyTeamCallbackQueryEvent({type: '', payload: {}, eventId: 1})).toBeFalsy();
	});

	test('isMyTeamCallbackQueryEvent true', () => {
		expect(isMyTeamCallbackQueryEvent({type: 'callbackQuery', payload: {}, eventId: 1})).toBeTruthy();
	});

	test('isString false', () => {
		expect(isString({})).toBeFalsy();
	});

	test('isString true', () => {
		expect(isString('')).toBeTruthy();
	});
});
