export function getNewMessageEvent() {
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
			text: 'Hello!',
			timestamp: Math.floor(Date.now() / 1000),
		},
	} as const;
}
