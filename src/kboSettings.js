/*
 * kbo-Startpage Settings
 */

class kboSettings {
	// Data Structure for Settings (and default values)
	data = {
		WeatherLoc: '25.867377,-80.120379',
		WeatherUnit: 'f',
		LinkL1v: true,  LinkL1d: 'Die ZEIT', LinkL1l: 'https://www.zeit.de/',
		LinkL2v: true,  LinkL2d: 'New York Times', LinkL2l: 'https://www.nytimes.com/',
		LinkL3v: false, LinkL3d: '', LinkL3l: 'https://',
		LinkL4v: false, LinkL4d: '', LinkL4l: 'https://',
		LinkR1v: true,  LinkR1d: 'Golem.de', LinkR1l: 'https://www.golem.de/',
		LinkR2v: true,  LinkR2d: 'iX News', LinkR2l: 'https://www.heise.de/ix/newsticker/',
		LinkR3v: true,  LinkR3d: 'Rock Paper Shotgun', LinkR3l: 'https://www.rockpapershotgun.com/latest',
		LinkR4v: false, LinkR4d: '', LinkR4l: 'https://',
		FeedBluesky: false, FeedBlueskyHost: '', FeedBlueskyIdentifier: '', FeedBlueskyPassword: '',
		FeedEasternsun: false,
		FeedFedora: true,
		FeedPlanetDebian: false,
		FeedReddit: false, FeedRedditUrl: '',
		FeedSlashdot: false,
		FeedTagesschau: true,
		FeedWowhead: false,
		FeedConnections: false,
		FeedZunder: false
	};

	// Meta Information (and default values)
	meta = {
		mode: 'auto', // 'auto' | 'light' | 'dark'
		lastUpdate: 0 // timestamp of last update
	};

	// Initialize settings and load from storage (if available)
	constructor(callback) {
		this.#loadSettingsAndMetaData(callback);
	}

	// Save all data to storage
	save(callback) {
		this.#storeSettings(() => {
			this.#storeMetaData(callback);
		});
	}

	// Update timestamp of last update
	updateTimestamp(timestamp) {
		this.meta.lastUpdate = timestamp || Date.now();
		this.#storeMetaData();
	}


	/* Private Methods */

	// Load settings from chrome storage
	#loadSettingsAndMetaData(callback) {
		Promise.all([
			new Promise(resolve => chrome.storage.sync.get(this.data, resolve)),
			new Promise(resolve => chrome.storage.local.get(this.meta, resolve))
		]).then(([syncData, localData]) => {
			this.data = syncData;
			this.meta = localData;
			if (callback) callback();
		});
	}

	// Save settings to chrome storage
	#storeSettings(callback) {
		// Extract Bluesky Host from Identifier
		if (this.data.FeedBlueskyIdentifier) {
			const parts = this.data.FeedBlueskyIdentifier.split('@');
			if (parts.length === 2) {
				this.data.FeedBlueskyHost = "https://" + parts[1];
			}
		} else {
			this.data.FeedBlueskyHost = '';
		}

		chrome.storage.sync.set(this.data, callback);
	}

	// Save meta information to chrome local storage
	#storeMetaData(callback) {
		chrome.storage.local.set(this.meta, callback);
	}

}


// Export-Functionality requried for Unit-Tests
/* global module */
if (typeof module !== 'undefined' && module.exports) {
	module.exports = kboSettings;
}
