// https://developer.chrome.com/extensions/options

/* global kboSettings */
var settings;

document.addEventListener('DOMContentLoaded', initialize, false);
window.onbeforeunload = save_options;

function initialize(){
	document.getElementById('save').addEventListener('click', save_options);
	settings = new kboSettings(function(){ restore_options(); });
}

function save_options(){
	// Get values from form
	settings.data.WeatherLoc  = document.getElementById('weatherLoc').value;
	settings.data.WeatherUnit = document.getElementById('weatherTTf').checked ? "f" : "c";
	settings.data.LinkL1v = document.getElementById('linkL1v').checked;
	settings.data.LinkL2v = document.getElementById('linkL2v').checked;
	settings.data.LinkL3v = document.getElementById('linkL3v').checked;
	settings.data.LinkL4v = document.getElementById('linkL4v').checked;
	settings.data.LinkR1v = document.getElementById('linkR1v').checked;
	settings.data.LinkR2v = document.getElementById('linkR2v').checked;
	settings.data.LinkR3v = document.getElementById('linkR3v').checked;
	settings.data.LinkR4v = document.getElementById('linkR4v').checked;
	settings.data.LinkL1l = document.getElementById('linkL1l').value;
	settings.data.LinkL1d = document.getElementById('linkL1d').value;
	settings.data.LinkL2l = document.getElementById('linkL2l').value;
	settings.data.LinkL2d = document.getElementById('linkL2d').value;
	settings.data.LinkL3l = document.getElementById('linkL3l').value;
	settings.data.LinkL3d = document.getElementById('linkL3d').value;
	settings.data.LinkL4l = document.getElementById('linkL4l').value;
	settings.data.LinkL4d = document.getElementById('linkL4d').value;
	settings.data.LinkR1l = document.getElementById('linkR1l').value;
	settings.data.LinkR1d = document.getElementById('linkR1d').value;
	settings.data.LinkR2l = document.getElementById('linkR2l').value;
	settings.data.LinkR2d = document.getElementById('linkR2d').value;
	settings.data.LinkR3l = document.getElementById('linkR3l').value;
	settings.data.LinkR3d = document.getElementById('linkR3d').value;
	settings.data.LinkR4l = document.getElementById('linkR4l').value;
	settings.data.LinkR4d = document.getElementById('linkR4d').value;
	settings.data.FeedBluesky           = document.getElementById('feedBluesky').checked;
	settings.data.FeedBlueskyIdentifier = document.getElementById('feedBlueskyIdentifier').value;
	settings.data.FeedBlueskyPassword   = document.getElementById('feedBlueskyPassword').value;
	settings.data.FeedEasternsun        = document.getElementById('feedEasternsun').checked;
	settings.data.FeedFedora            = document.getElementById('feedFedora').checked;
	settings.data.FeedPlanetDebian      = document.getElementById('feedPlanetDebian').checked;
	settings.data.FeedReddit            = document.getElementById('feedReddit').checked;
	settings.data.FeedRedditUrl         = document.getElementById('feedRedditUrl').value;
	settings.data.FeedSlashdot          = document.getElementById('feedSlashdot').checked;
	settings.data.FeedTagesschau        = document.getElementById('feedTagesschau').checked;
	settings.data.FeedWowhead           = document.getElementById('feedWowhead').checked;
	settings.data.FeedConnections       = document.getElementById('feedConnections').checked;
	settings.data.FeedZunder            = document.getElementById('feedZunder').checked;

	// Handle Darkmode
	if (document.getElementById('mode_dark').checked) {
		settings.meta.mode = 'dark';
	} else if (document.getElementById('mode_light').checked) {
		settings.meta.mode = 'light';
	} else {
		settings.meta.mode = 'auto';
	}

	// Save all settings
	settings.save(function() {
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function() {
			status.textContent = '';
		}, 750);
	});
}

function restore_options(){
	// Populate form with loaded settings
	// Weather
	document.getElementById('weatherLoc').value   = settings.data.WeatherLoc;
	document.getElementById('weatherTTc').checked = settings.data.WeatherUnit == 'c';
	document.getElementById('weatherTTf').checked = settings.data.WeatherUnit == 'f';
	
	// Links
	document.getElementById('linkL1v').checked = settings.data.LinkL1v;
	document.getElementById('linkL2v').checked = settings.data.LinkL2v;
	document.getElementById('linkL3v').checked = settings.data.LinkL3v;
	document.getElementById('linkL4v').checked = settings.data.LinkL4v;
	document.getElementById('linkR1v').checked = settings.data.LinkR1v;
	document.getElementById('linkR2v').checked = settings.data.LinkR2v;
	document.getElementById('linkR3v').checked = settings.data.LinkR3v;
	document.getElementById('linkR4v').checked = settings.data.LinkR4v;
	document.getElementById('linkL1l').value   = settings.data.LinkL1l;
	document.getElementById('linkL2l').value   = settings.data.LinkL2l;
	document.getElementById('linkL3l').value   = settings.data.LinkL3l;
	document.getElementById('linkL4l').value   = settings.data.LinkL4l;
	document.getElementById('linkR1l').value   = settings.data.LinkR1l;
	document.getElementById('linkR2l').value   = settings.data.LinkR2l;
	document.getElementById('linkR3l').value   = settings.data.LinkR3l;
	document.getElementById('linkR4l').value   = settings.data.LinkR4l;
	document.getElementById('linkL1d').value   = settings.data.LinkL1d;
	document.getElementById('linkL2d').value   = settings.data.LinkL2d;
	document.getElementById('linkL3d').value   = settings.data.LinkL3d;
	document.getElementById('linkL4d').value   = settings.data.LinkL4d;
	document.getElementById('linkR1d').value   = settings.data.LinkR1d;
	document.getElementById('linkR2d').value   = settings.data.LinkR2d;
	document.getElementById('linkR3d').value   = settings.data.LinkR3d;
	document.getElementById('linkR4d').value   = settings.data.LinkR4d;
	
	// Feeds
	document.getElementById('feedBluesky').checked         = settings.data.FeedBluesky;
	document.getElementById('feedBlueskyIdentifier').value = settings.data.FeedBlueskyIdentifier;
	document.getElementById('feedBlueskyPassword').value   = settings.data.FeedBlueskyPassword;
	document.getElementById('feedEasternsun').checked      = settings.data.FeedEasternsun;
	document.getElementById('feedFedora').checked          = settings.data.FeedFedora;
	document.getElementById('feedPlanetDebian').checked    = settings.data.FeedPlanetDebian;
	document.getElementById('feedReddit').checked          = settings.data.FeedReddit;
	document.getElementById('feedRedditUrl').value         = settings.data.FeedRedditUrl;
	document.getElementById('feedSlashdot').checked        = settings.data.FeedSlashdot;
	document.getElementById('feedTagesschau').checked      = settings.data.FeedTagesschau;
	document.getElementById('feedWowhead').checked         = settings.data.FeedWowhead;
	document.getElementById('feedConnections').checked     = settings.data.FeedConnections;
	document.getElementById('feedZunder').checked          = settings.data.FeedZunder;
	
	// Darkmode
	document.getElementById('mode_automatic').checked      = settings.meta.mode == 'auto';
	document.getElementById('mode_dark').checked           = settings.meta.mode == 'dark';
	document.getElementById('mode_light').checked          = settings.meta.mode == 'light';
}
