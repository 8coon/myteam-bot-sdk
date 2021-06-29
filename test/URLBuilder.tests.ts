import {URLBuilder} from "../src";

describe('URLBuilder', () => {
	test('basic', () => {
		expect(
			new URLBuilder('test', 'http://localhost')
				.toString()
		).toEqual(
			'http://localhost/test'
		)
	});

	test('appendQuery', () => {
		expect(
			new URLBuilder('test', 'http://localhost')
				.appendQuery('param', 'v@lue')
				.toString()
		).toEqual(
			'http://localhost/test?param=v%40lue'
		)
	});

	test('appendQueryObject', () => {
		expect(
			new URLBuilder('test', 'http://localhost')
				.appendQueryObject({a: 1, b: 2})
				.toString()
		).toEqual(
			'http://localhost/test?a=1&b=2'
		)
	});

	test('appendQueryIfTruthy true', () => {
		expect(
			new URLBuilder('test', 'http://localhost')
				.appendQueryIfTruthy('param', '1')
				.toString()
		).toEqual(
			'http://localhost/test?param=1'
		)
	});

	test('appendQueryIfTruthy false', () => {
		expect(
			new URLBuilder('test', 'http://localhost')
				.appendQueryIfTruthy('param')
				.toString()
		).toEqual(
			'http://localhost/test'
		)
	});
});
