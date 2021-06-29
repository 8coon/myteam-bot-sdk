import {escapeHTML} from "../src";

describe('escapeHTML', () => {
	test('5 > 3 && \'7\' < "10"', () => {
		expect(escapeHTML('5 > 3 && \'7\' < "10"')).toEqual(
			'5 &gt; 3 &amp;&amp; &#039;7&#039; &lt; &quot;10&quot;'
		)
	});
})
