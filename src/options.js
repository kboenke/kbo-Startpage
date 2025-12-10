// https://developer.chrome.com/extensions/options
document.addEventListener('DOMContentLoaded', initialize, false);
window.onbeforeunload = save_options;
function initialize(){
	document.addEventListener('DOMContentLoaded', restore_options);
	document.getElementById('save').addEventListener('click', save_options);
	restore_options();
}

function save_options(){
	//Get values
	var weatherLoc = document.getElementById('weatherLoc').value;
	var weatherUnit = (document.getElementById('weatherTTf').checked) ? "f" : "c";
	var linkL1v = (document.getElementById('linkL1v').checked) ? true : false;
	var linkL2v = (document.getElementById('linkL2v').checked) ? true : false;
	var linkL3v = (document.getElementById('linkL3v').checked) ? true : false;
	var linkL4v = (document.getElementById('linkL4v').checked) ? true : false;
	var linkR1v = (document.getElementById('linkR1v').checked) ? true : false;
	var linkR2v = (document.getElementById('linkR2v').checked) ? true : false;
	var linkR3v = (document.getElementById('linkR3v').checked) ? true : false;
	var linkR4v = (document.getElementById('linkR4v').checked) ? true : false;
	var linkL1l = document.getElementById('linkL1l').value;
	var linkL1d = document.getElementById('linkL1d').value;
	var linkL2l = document.getElementById('linkL2l').value;
	var linkL2d = document.getElementById('linkL2d').value;
	var linkL3l = document.getElementById('linkL3l').value;
	var linkL3d = document.getElementById('linkL3d').value;
	var linkL4l = document.getElementById('linkL4l').value;
	var linkL4d = document.getElementById('linkL4d').value;
	var linkR1l = document.getElementById('linkR1l').value;
	var linkR1d = document.getElementById('linkR1d').value;
	var linkR2l = document.getElementById('linkR2l').value;
	var linkR2d = document.getElementById('linkR2d').value;
	var linkR3l = document.getElementById('linkR3l').value;
	var linkR3d = document.getElementById('linkR3d').value;
	var linkR4l = document.getElementById('linkR4l').value;
	var linkR4d = document.getElementById('linkR4d').value;
	var feedEasternsun = (document.getElementById('feedEasternsun').checked) ? true : false;
	var feedPlanetDebian = (document.getElementById('feedPlanetDebian').checked) ? true : false;
	var feedReddit = (document.getElementById('feedReddit').checked) ? true : false;
	var feedRedditUrl = document.getElementById('feedRedditUrl').value;
	var feedSlashdot = (document.getElementById('feedSlashdot').checked) ? true : false;
	var feedTagesschau = (document.getElementById('feedTagesschau').checked) ? true : false;
	var feedWowhead = (document.getElementById('feedWowhead').checked) ? true : false;
	var feedConnections = (document.getElementById('feedConnections').checked) ? true : false;
	var feedZunder = (document.getElementById('feedZunder').checked) ? true : false;

	//Store values
	chrome.storage.sync.set({
			WeatherLoc:		weatherLoc,
			WeatherUnit:	weatherUnit,
			LinkL1v:		linkL1v,
			LinkL2v:		linkL2v,
			LinkL3v:		linkL3v,
			LinkL4v:		linkL4v,
			LinkR1v:		linkR1v,
			LinkR2v:		linkR2v,
			LinkR3v:		linkR3v,
			LinkR4v:		linkR4v,
			LinkL1l:		linkL1l,
			LinkL1d:		linkL1d,
			LinkL2l:		linkL2l,
			LinkL2d:		linkL2d,
			LinkL3l:		linkL3l,
			LinkL3d:		linkL3d,
			LinkL4l:		linkL4l,
			LinkL4d:		linkL4d,
			LinkR1l:		linkR1l,
			LinkR1d:		linkR1d,
			LinkR2l:		linkR2l,
			LinkR2d:		linkR2d,
			LinkR3l:		linkR3l,
			LinkR3d:		linkR3d,
			LinkR4l:		linkR4l,
			LinkR4d:		linkR4d,
			FeedEasternsun:			feedEasternsun,
			FeedPlanetDebian:		feedPlanetDebian,
			FeedReddit:				feedReddit,
			FeedRedditUrl:			feedRedditUrl,
			FeedSlashdot:			feedSlashdot,
			FeedTagesschau:			feedTagesschau,
			FeedWowhead:			feedWowhead,
			FeedConnections:		feedConnections,
			FeedZunder:				feedZunder,
		}, function() {
			// Update status to let user know options were saved.
			var status = document.getElementById('status');
			status.textContent = 'Options saved.';
			setTimeout(function() {
				status.textContent = '';
			}, 750);
		}
	);

	// Handle Darkmode
	var scheme = (document.getElementById('scheme_automatic').checked) ? "auto" : false;
	if (scheme != "auto") scheme = (document.getElementById('scheme_darkmode').checked) ? "dark" : "light";
	chrome.storage.local.set({'kboStartpage_scheme': scheme}, function(){});
console.log(scheme);
}

function restore_options(){
	//Read values
	chrome.storage.sync.get({
		WeatherLoc:		'25.867377,-80.120379',
		WeatherUnit:	'f',
		LinkL1v:		false,
		LinkL2v:		false,
		LinkL3v:		false,
		LinkL4v:		false,
		LinkR1v:		false,
		LinkR2v:		false,
		LinkR3v:		false,
		LinkR4v:		false,
		LinkL1l:		'https://',
		LinkL1d:		'',
		LinkL2l:		'https://',
		LinkL2d:		'',
		LinkL3l:		'https://',
		LinkL3d:		'',
		LinkL4l:		'https://',
		LinkL4d:		'',
		LinkR1l:		'https://',
		LinkR1d:		'',
		LinkR2l:		'https://',
		LinkR2d:		'',
		LinkR3l:		'https://',
		LinkR3d:		'',
		LinkR4l:		'https://',
		LinkR4d:		'',
		FeedEasternsun:			false,
		FeedPlanetDebian:		true,
		FeedReddit:				false,
		FeedRedditUrl:			'',
		FeedSlashdot:			false,
		FeedTagesschau:			true,
		FeedWowhead:			false,
		FeedConnections:		false,
		FeedZunder:				false,
	}, function(items){
	//Set values
		//Weather
		document.getElementById('weatherLoc').value = items.WeatherLoc;
		if(items.WeatherUnit == 'c'){
			document.getElementById('weatherTTc').checked = true;
			document.getElementById('weatherTTf').checked = false;
		}else{
			document.getElementById('weatherTTf').checked = true;
			document.getElementById('weatherTTc').checked = false;
		}
		//Links
		document.getElementById('linkL1v').checked = items.LinkL1v;
		document.getElementById('linkL2v').checked = items.LinkL2v;
		document.getElementById('linkL3v').checked = items.LinkL3v;
		document.getElementById('linkL4v').checked = items.LinkL4v;
		document.getElementById('linkR1v').checked = items.LinkR1v;
		document.getElementById('linkR2v').checked = items.LinkR2v;
		document.getElementById('linkR3v').checked = items.LinkR3v;
		document.getElementById('linkR4v').checked = items.LinkR4v;
		document.getElementById('linkL1l').value = items.LinkL1l;
		document.getElementById('linkL2l').value = items.LinkL2l;
		document.getElementById('linkL3l').value = items.LinkL3l;
		document.getElementById('linkL4l').value = items.LinkL4l;
		document.getElementById('linkR1l').value = items.LinkR1l;
		document.getElementById('linkR2l').value = items.LinkR2l;
		document.getElementById('linkR3l').value = items.LinkR3l;
		document.getElementById('linkR4l').value = items.LinkR4l;
		document.getElementById('linkL1d').value = items.LinkL1d;
		document.getElementById('linkL2d').value = items.LinkL2d;
		document.getElementById('linkL3d').value = items.LinkL3d;
		document.getElementById('linkL4d').value = items.LinkL4d;
		document.getElementById('linkR1d').value = items.LinkR1d;
		document.getElementById('linkR2d').value = items.LinkR2d;
		document.getElementById('linkR3d').value = items.LinkR3d;
		document.getElementById('linkR4d').value = items.LinkR4d;
		//Feeds
		document.getElementById('feedEasternsun').checked = items.FeedEasternsun;
		document.getElementById('feedPlanetDebian').checked = items.FeedPlanetDebian;
		document.getElementById('feedReddit').checked = items.FeedReddit;
		document.getElementById('feedRedditUrl').value = items.FeedRedditUrl;
		document.getElementById('feedSlashdot').checked = items.FeedSlashdot;
		document.getElementById('feedTagesschau').checked = items.FeedTagesschau;
		document.getElementById('feedWowhead').checked = items.FeedWowhead;
		document.getElementById('feedConnections').checked = items.FeedConnections;
		document.getElementById('feedZunder').checked = items.FeedZunder;
	});

	//Darkmode
	chrome.storage.local.get({kboStartpage_scheme: 'auto'}, function(storedData){
		switch(storedData.kboStartpage_scheme){
			case "auto":	document.getElementById('scheme_automatic').checked = true; break;
			case "dark":	document.getElementById('scheme_darkmode').checked = true; break;
			case "light":	document.getElementById('scheme_lightmode').checked = true; break;
		}
	});
}
