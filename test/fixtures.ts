export function getNewMessageEvent(text: string = '') {
	return {
		type: 'newMessage',
		payload: {
			from: {
				userId: '1@user',
				firstName: 'User',
				lastName: 'Name',
			},
			chat: {
				chatId: '1@chat',
				type: 'group',
				title: 'Admin Chat',
			},
			msgId: '1',
			text,
			timestamp: Math.floor(Date.now() / 1000),
		},
	} as const;
}

export function getEditedMessageEvent(text: string) {
	return {
		type: 'editedMessage',
		payload: {
			from: {
				userId: '1@user',
				firstName: 'User',
				lastName: 'Name',
			},
			chat: {
				chatId: '1@chat',
				type: 'group',
				title: 'Admin Chat',
			},
			msgId: '1',
			text,
			timestamp: Math.floor(Date.now() / 1000),
			editedTimestamp: Math.floor(Date.now() / 1000),
		},
	} as const;
}

export function getCallbackQueryEvent(queryId: string) {
	return {
		type: 'callbackQuery',
		payload: {
			queryId,
			from: {
				userId: '1@user',
				firstName: 'User',
				lastName: 'Name',
			},
			message: {
				from: {
					userId: '1@user',
					firstName: 'User',
					lastName: 'Name',
				},
				chat: {
					chatId: '1@chat',
					type: 'group',
					title: 'Admin Chat',
				},
				msgId: '1',
				text: 'some message',
				timestamp: Math.floor(Date.now() / 1000),
			},
			callbackData: 'some data',
		}
	} as const;
}
