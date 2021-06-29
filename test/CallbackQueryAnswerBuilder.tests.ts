import {CallbackQueryAnswerBuilder} from "../src";

describe('CallbackQueryAnswerBuilder', () => {
	test('basic', () => {
		expect(
			new CallbackQueryAnswerBuilder()
				.toObject()
		).toEqual(
			{}
		);
	});

	test('text', () => {
		expect(
			new CallbackQueryAnswerBuilder()
				.text('clicked')
				.toObject()
		).toEqual(
			{
				text: 'clicked',
			}
		);
	});

	test('alert', () => {
		expect(
			new CallbackQueryAnswerBuilder()
				.alert('clicked')
				.toObject()
		).toEqual(
			{
				text: 'clicked',
				showAlert: 'true',
			}
		);
	});

	test('url', () => {
		expect(
			new CallbackQueryAnswerBuilder()
				.url('https://example.com')
				.toObject()
		).toEqual(
			{
				url: 'https://example.com',
			}
		);
	});

	test('url after text', () => {
		expect(
			new CallbackQueryAnswerBuilder()
				.text('hello')
				.url('https://example.com')
				.toObject()
		).toEqual(
			{
				url: 'https://example.com',
			}
		);
	});
});
