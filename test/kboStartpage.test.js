/**
 * Unit tests for kboStartpage class
 */

const fs = require('fs');
const path = require('path');

// Mock the Chrome API
global.chrome = {
	storage: {
		sync: {
			get: jest.fn(),
			set: jest.fn()
		},
		local: {
			get: jest.fn(),
			set: jest.fn()
		}
	}
};

// Load the kboStartpage class
const kboStartpageCode = fs.readFileSync(
	path.join(__dirname, '../src/kboStartpage.js'),
	'utf8'
);
// Evaluate the code and extract the class
eval(kboStartpageCode);
// The class should now be available in this scope

describe('kboStartpage class', () => {
	beforeEach(() => {
		// Clear all mock calls before each test
		jest.clearAllMocks();
	});

	describe('Constructor and initialization', () => {
		test('initializes with default data values', () => {
			const settings = new kboStartpage();
			
			expect(settings.data).toBeDefined();
			expect(settings.data.WeatherLoc).toBe('25.867377,-80.120379');
			expect(settings.data.WeatherUnit).toBe('f');
			expect(settings.data.LinkL1v).toBe(true);
			expect(settings.data.FeedPlanetDebian).toBe(true);
			expect(settings.data.FeedTagesschau).toBe(true);
		});

		test('initializes with default meta values', () => {
			const settings = new kboStartpage();
			
			expect(settings.meta).toBeDefined();
			expect(settings.meta.mode).toBe('auto');
			expect(settings.meta.lastUpdate).toBe(0);
		});

		test('calls chrome.storage.sync.get on initialization', () => {
			chrome.storage.sync.get.mockImplementation((defaults, callback) => {
				callback(defaults);
			});

			new kboStartpage();
			
			expect(chrome.storage.sync.get).toHaveBeenCalled();
		});

		test('calls chrome.storage.local.get on initialization', () => {
			chrome.storage.local.get.mockImplementation((defaults, callback) => {
				callback(defaults);
			});

			new kboStartpage();
			
			expect(chrome.storage.local.get).toHaveBeenCalled();
		});

		test('executes callback after loading data', (done) => {
			chrome.storage.sync.get.mockImplementation((defaults, callback) => {
				callback(defaults);
			});
			chrome.storage.local.get.mockImplementation((defaults, callback) => {
				callback(defaults);
			});

			const mockCallback = jest.fn();
			new kboStartpage(mockCallback);
			
			// Callback should be called after async operations
			setTimeout(() => {
				expect(mockCallback).toHaveBeenCalled();
				done();
			}, 10);
		});
	});

	describe('Data loading', () => {
		test('loads data from chrome.storage.sync', (done) => {
			const mockData = {
				WeatherLoc: '40.7128,-74.0060',
				WeatherUnit: 'c',
				LinkL1v: false,
				FeedReddit: true
			};

			chrome.storage.sync.get.mockImplementation((defaults, callback) => {
				callback({ ...defaults, ...mockData });
			});
			chrome.storage.local.get.mockImplementation((defaults, callback) => {
				callback(defaults);
			});

			const settings = new kboStartpage(() => {
				expect(settings.data.WeatherLoc).toBe('40.7128,-74.0060');
				expect(settings.data.WeatherUnit).toBe('c');
				expect(settings.data.LinkL1v).toBe(false);
				expect(settings.data.FeedReddit).toBe(true);
				done();
			});
		});

		test('loads meta from chrome.storage.local', (done) => {
			const mockMeta = {
				mode: 'dark',
				lastUpdate: 1234567890
			};

			chrome.storage.sync.get.mockImplementation((defaults, callback) => {
				callback(defaults);
			});
			chrome.storage.local.get.mockImplementation((defaults, callback) => {
				callback({ ...defaults, ...mockMeta });
			});

			const settings = new kboStartpage(() => {
				expect(settings.meta.mode).toBe('dark');
				expect(settings.meta.lastUpdate).toBe(1234567890);
				done();
			});
		});
	});

	describe('save() method', () => {
		test('calls chrome.storage.sync.set with data', (done) => {
			chrome.storage.sync.get.mockImplementation((defaults, callback) => {
				callback(defaults);
			});
			chrome.storage.local.get.mockImplementation((defaults, callback) => {
				callback(defaults);
			});
			chrome.storage.sync.set.mockImplementation((data, callback) => {
				if (callback) callback();
			});
			chrome.storage.local.set.mockImplementation((data, callback) => {
				if (callback) callback();
			});

			const settings = new kboStartpage(() => {
				settings.data.WeatherLoc = '51.5074,-0.1278';
				settings.save(() => {
					expect(chrome.storage.sync.set).toHaveBeenCalledWith(
						settings.data,
						expect.any(Function)
					);
					done();
				});
			});
		});

		test('calls chrome.storage.local.set with meta', (done) => {
			chrome.storage.sync.get.mockImplementation((defaults, callback) => {
				callback(defaults);
			});
			chrome.storage.local.get.mockImplementation((defaults, callback) => {
				callback(defaults);
			});
			chrome.storage.sync.set.mockImplementation((data, callback) => {
				if (callback) callback();
			});
			chrome.storage.local.set.mockImplementation((data, callback) => {
				if (callback) callback();
			});

			const settings = new kboStartpage(() => {
				settings.meta.mode = 'light';
				settings.save(() => {
					expect(chrome.storage.local.set).toHaveBeenCalledWith(
						settings.meta,
						expect.any(Function)
					);
					done();
				});
			});
		});
	});

	describe('updateTimestamp() method', () => {
		test('updates lastUpdate to current time when called without argument', (done) => {
			chrome.storage.sync.get.mockImplementation((defaults, callback) => {
				callback(defaults);
			});
			chrome.storage.local.get.mockImplementation((defaults, callback) => {
				callback(defaults);
			});
			chrome.storage.local.set.mockImplementation((data, callback) => {
				if (callback) callback();
			});

			const settings = new kboStartpage(() => {
				const beforeTime = Date.now();
				settings.updateTimestamp();
				const afterTime = Date.now();
				
				expect(settings.meta.lastUpdate).toBeGreaterThanOrEqual(beforeTime);
				expect(settings.meta.lastUpdate).toBeLessThanOrEqual(afterTime);
				expect(chrome.storage.local.set).toHaveBeenCalled();
				done();
			});
		});

		test('updates lastUpdate to provided timestamp', (done) => {
			chrome.storage.sync.get.mockImplementation((defaults, callback) => {
				callback(defaults);
			});
			chrome.storage.local.get.mockImplementation((defaults, callback) => {
				callback(defaults);
			});
			chrome.storage.local.set.mockImplementation((data, callback) => {
				if (callback) callback();
			});

			const settings = new kboStartpage(() => {
				const customTime = 1234567890000;
				settings.updateTimestamp(customTime);
				
				expect(settings.meta.lastUpdate).toBe(customTime);
				expect(chrome.storage.local.set).toHaveBeenCalledWith(
					expect.objectContaining({ lastUpdate: customTime }),
					undefined
				);
				done();
			});
		});
	});

	describe('Data structure validation', () => {
		test('has all required weather settings', () => {
			const settings = new kboStartpage();
			
			expect(settings.data).toHaveProperty('WeatherLoc');
			expect(settings.data).toHaveProperty('WeatherUnit');
		});

		test('has all required link settings', () => {
			const settings = new kboStartpage();
			
			// Left links
			expect(settings.data).toHaveProperty('LinkL1v');
			expect(settings.data).toHaveProperty('LinkL1d');
			expect(settings.data).toHaveProperty('LinkL1l');
			expect(settings.data).toHaveProperty('LinkL2v');
			expect(settings.data).toHaveProperty('LinkL3v');
			expect(settings.data).toHaveProperty('LinkL4v');
			
			// Right links
			expect(settings.data).toHaveProperty('LinkR1v');
			expect(settings.data).toHaveProperty('LinkR1d');
			expect(settings.data).toHaveProperty('LinkR1l');
			expect(settings.data).toHaveProperty('LinkR2v');
			expect(settings.data).toHaveProperty('LinkR3v');
			expect(settings.data).toHaveProperty('LinkR4v');
		});

		test('has all required feed settings', () => {
			const settings = new kboStartpage();
			
			expect(settings.data).toHaveProperty('FeedEasternsun');
			expect(settings.data).toHaveProperty('FeedPlanetDebian');
			expect(settings.data).toHaveProperty('FeedReddit');
			expect(settings.data).toHaveProperty('FeedRedditUrl');
			expect(settings.data).toHaveProperty('FeedSlashdot');
			expect(settings.data).toHaveProperty('FeedTagesschau');
			expect(settings.data).toHaveProperty('FeedWowhead');
			expect(settings.data).toHaveProperty('FeedConnections');
			expect(settings.data).toHaveProperty('FeedZunder');
		});

		test('has all required meta properties', () => {
			const settings = new kboStartpage();
			
			expect(settings.meta).toHaveProperty('mode');
			expect(settings.meta).toHaveProperty('lastUpdate');
		});
	});
});
