import {MessageBuilder} from "../src";

describe('MessageBuilder', () => {
	test('basic', () => {
		expect(
			new MessageBuilder()
				.toObject()
		).toEqual(
			{
				text: '',
			}
		)
	});

	test('text', () => {
		expect(
			new MessageBuilder()
				.text('hello')
				.toObject()
		).toEqual(
			{
				text: 'hello',
			}
		)
	});

	test('replyTo', () => {
		expect(
			new MessageBuilder()
				.replyTo('1')
				.toObject()
		).toEqual(
			{
				replyMsgId: '1',
				text: '',
			}
		)
	});

	test('forwardFrom one', () => {
		expect(
			new MessageBuilder()
				.forwardFrom('1', '1@chat')
				.toObject()
		).toEqual(
			{
				forwardChatId: '1@chat',
				forwardMsgId: '1',
				text: '',
			}
		)
	});

	test('forwardFrom many', () => {
		expect(
			new MessageBuilder()
				.forwardFrom('1', '1@chat')
				.forwardFrom('2', '1@chat')
				.toObject()
		).toEqual(
			{
				forwardChatId: '1@chat',
				forwardMsgId: '1,2',
				text: '',
			}
		)
	});

	test('buttonRow empty', () => {
		expect(
			new MessageBuilder()
				.buttonRow()
				.toObject()
		).toEqual(
			{
				inlineKeyboardMarkup: '[[]]',
				text: '',
			}
		)
	});

	test('buttonRow two', () => {
		expect(
			new MessageBuilder()
				.buttonRow()
				.buttonRow()
				.toObject()
		).toEqual(
			{
				inlineKeyboardMarkup: '[[],[]]',
				text: '',
			}
		)
	});

	test('button', () => {
		expect(
			new MessageBuilder()
				.button({text: 'click', style: 'primary', callbackData: 'data'})
				.toObject()
		).toEqual(
			{
				inlineKeyboardMarkup: '[[{"text":"click","style":"primary","callbackData":"data"}]]',
				text: '',
			}
		)
	});

	test('button in empty row', () => {
		expect(
			new MessageBuilder()
				.buttonRow()
				.button({text: 'click', style: 'primary', callbackData: 'data'})
				.toObject()
		).toEqual(
			{
				inlineKeyboardMarkup: '[[{"text":"click","style":"primary","callbackData":"data"}]]',
				text: '',
			}
		)
	});

	test('formatText style none', () => {
		expect(
			new MessageBuilder()
				.formatText('none', 'hello')
				.toObject()
		).toEqual(
			{
				text: 'hello',
			}
		)
	});

	test('formatText style bold', () => {
		expect(
			new MessageBuilder()
				.formatText('bold', 'hello')
				.toObject()
		).toEqual(
			{
				format: '{"bold":[{"offset":0,"length":5}]}',
				text: 'hello',
			}
		)
	});

	test('formatText style italic twice', () => {
		expect(
			new MessageBuilder()
				.formatText('italic', 'hello')
				.formatText('italic', 'world')
				.toObject()
		).toEqual(
			{
				format: '{"italic":[{"offset":0,"length":5},{"offset":5,"length":5}]}',
				text: 'helloworld',
			}
		)
	});

	test('markdown', () => {
		expect(
			new MessageBuilder()
				.markdown('markdown value')
				.toObject()
		).toEqual(
			{
				parseMode: 'MarkdownV2',
				text: 'markdown value',
			}
		)
	});

	test('html', () => {
		expect(
			new MessageBuilder()
				.html('html value')
				.toObject()
		).toEqual(
			{
				parseMode: 'HTML',
				text: 'html value',
			}
		)
	});

	test('markdown after formatText', () => {
		expect(
			new MessageBuilder()
				.formatText('italic', 'hello')
				.markdown('markdown value')
				.toObject()
		).toEqual(
			{
				parseMode: 'MarkdownV2',
				text: 'markdown value',
			}
		)
	});

	test('formatText after html', () => {
		expect(
			new MessageBuilder()
				.html('html value')
				.formatText('italic', 'hello')
				.toObject()
		).toEqual(
			{
				format: '{"italic":[{"offset":0,"length":5}]}',
				text: 'hello',
			}
		)
	});
});
