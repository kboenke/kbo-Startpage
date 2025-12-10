/**
 * Unit tests for helper functions in startpage.js
 * These tests focus on pure functions without DOM/Chrome API dependencies
 */

const fs = require('fs');
const path = require('path');

// Mock the browser environment before loading startpage.js
global.chrome = {
	storage: {
		sync: { get: jest.fn() },
		local: { get: jest.fn(), set: jest.fn() }
	}
};

mockJQuery.ajax = jest.fn();
mockJQuery.each = jest.fn();
global.$ = mockJQuery;

// Read and execute the startpage.js file to get the actual functions
const startpageCode = fs.readFileSync(
	path.join(__dirname, '../src/startpage.js'),
	'utf8'
);

// Extract and evaluate just the helper functions we want to test
// This is a bit hacky but allows us to test the actual code
eval(startpageCode);

// Now getNonce, getFavicon, translateWeathercode, and String.format are available
// from the actual source file

describe('String.format()', () => {
	test('formats string with single placeholder', () => {
		const result = String.format('Hello {0}!', 'World');
		expect(result).toBe('Hello World!');
	});

	test('formats string with multiple placeholders', () => {
		const result = String.format('{0} {1} {2}', 'one', 'two', 'three');
		expect(result).toBe('one two three');
	});

	test('formats string with repeated placeholders', () => {
		const result = String.format('{0} and {0}', 'test');
		expect(result).toBe('test and test');
	});

	test('formats HTML-like strings', () => {
		const result = String.format('<a href="{0}">{1}</a>', 'https://example.com', 'Link');
		expect(result).toBe('<a href="https://example.com">Link</a>');
	});

	test('handles empty string', () => {
		const result = String.format('', 'unused');
		expect(result).toBe('');
	});

	test('handles no placeholders', () => {
		const result = String.format('No placeholders here');
		expect(result).toBe('No placeholders here');
	});
});

describe('getNonce()', () => {
	test('generates string of correct length', () => {
		expect(getNonce(10)).toHaveLength(10);
		expect(getNonce(32)).toHaveLength(32);
		expect(getNonce(64)).toHaveLength(64);
	});

	test('generates string with only alphanumeric characters', () => {
		const nonce = getNonce(100);
		expect(nonce).toMatch(/^[A-Za-z0-9]+$/);
	});

	test('generates different values on subsequent calls', () => {
		const nonce1 = getNonce(32);
		const nonce2 = getNonce(32);
		expect(nonce1).not.toBe(nonce2);
	});

	test('handles length of 1', () => {
		const nonce = getNonce(1);
		expect(nonce).toHaveLength(1);
		expect(nonce).toMatch(/^[A-Za-z0-9]$/);
	});

	test('handles length of 0', () => {
		expect(getNonce(0)).toBe('');
	});
});

describe('getFavicon()', () => {
	test('extracts domain from http URL', () => {
		const result = getFavicon('http://example.com/path');
		expect(result).toBe('http://www.google.com/s2/favicons?domain=example.com');
	});

	test('extracts domain from https URL', () => {
		const result = getFavicon('https://example.com/path');
		expect(result).toBe('http://www.google.com/s2/favicons?domain=example.com');
	});

	test('handles URL with query parameters', () => {
		const result = getFavicon('https://example.com/path?query=value');
		expect(result).toBe('http://www.google.com/s2/favicons?domain=example.com');
	});

	test('handles URL with hash fragment', () => {
		const result = getFavicon('https://example.com/path#section');
		expect(result).toBe('http://www.google.com/s2/favicons?domain=example.com');
	});

	test('returns custom icon for bosch.com domain', () => {
		const result = getFavicon('https://www.bosch.com/page');
		expect(result).toBe('icons/bosch.png');
	});

	test('returns custom icon for boschdevcloud.com domain', () => {
		const result = getFavicon('https://app.boschdevcloud.com/page');
		expect(result).toBe('icons/bosch.png');
	});

	test('handles subdomain correctly', () => {
		const result = getFavicon('https://subdomain.example.com/path');
		expect(result).toBe('http://www.google.com/s2/favicons?domain=subdomain.example.com');
	});

	test('handles URL without protocol', () => {
		const result = getFavicon('example.com/path');
		expect(result).toBe('http://www.google.com/s2/favicons?domain=example.com');
	});
});

describe('translateWeathercode()', () => {
	test('translates clear sky (0)', () => {
		const result = translateWeathercode(0);
		expect(result).toEqual({ icon: "1", descr: "Clear sky" });
	});

	test('translates mainly clear (1)', () => {
		const result = translateWeathercode(1);
		expect(result).toEqual({ icon: "2", descr: "Mainly clear" });
	});

	test('translates partly cloudy (2)', () => {
		const result = translateWeathercode(2);
		expect(result).toEqual({ icon: "A", descr: "Partly cloudy" });
	});

	test('translates overcast (3)', () => {
		const result = translateWeathercode(3);
		expect(result).toEqual({ icon: "3", descr: "Overcast" });
	});

	test('translates fog (45)', () => {
		const result = translateWeathercode(45);
		expect(result).toEqual({ icon: "B", descr: "Fog" });
	});

	test('translates rain (63)', () => {
		const result = translateWeathercode(63);
		expect(result).toEqual({ icon: "K", descr: "Rain" });
	});

	test('translates snowfall (73)', () => {
		const result = translateWeathercode(73);
		expect(result).toEqual({ icon: "I", descr: "Snowfall" });
	});

	test('translates thunderstorms (95)', () => {
		const result = translateWeathercode(95);
		expect(result).toEqual({ icon: "S", descr: "Thunderstorms" });
	});

	test('translates thunderstorms with heavy hail (99)', () => {
		const result = translateWeathercode(99);
		expect(result).toEqual({ icon: "Q", descr: "Thunderstorms with heavy hail" });
	});

	test('handles unknown weather code', () => {
		const result = translateWeathercode(999);
		expect(result).toEqual({ icon: "star", descr: "Unknown" });
	});

	test('returns object with icon and descr properties', () => {
		const result = translateWeathercode(0);
		expect(result).toHaveProperty('icon');
		expect(result).toHaveProperty('descr');
	});

	test('handles all drizzle codes correctly', () => {
		expect(translateWeathercode(51).descr).toBe("Light drizzle");
		expect(translateWeathercode(53).descr).toBe("Drizzle");
		expect(translateWeathercode(55).descr).toBe("Dense drizzle");
	});

	test('handles all shower codes correctly', () => {
		expect(translateWeathercode(80).descr).toBe("Slight showers");
		expect(translateWeathercode(81).descr).toBe("Showers");
		expect(translateWeathercode(82).descr).toBe("Violent showers");
	});
});
