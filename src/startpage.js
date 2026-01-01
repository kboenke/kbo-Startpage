/* global kboSettings */
document.addEventListener('DOMContentLoaded', initialize, false);
var feedData = [];
var settings;

/* To be called after page is loaded */
function initialize(){
	// Load settings
	settings = new kboSettings(function(){
		// Trigger Darkmode
		if ((settings.meta.mode == 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
			|| (settings.meta.mode == 'dark')) {
			$("head").append("<link rel='stylesheet' id='extracss' href='startpage_dark.css' type='text/css'>");
		}
		
		// Populate main page
		loadLinks();
		loadWeather();
		loadFeeds();
	});
	
	// Schedule automatic refresh
	setInterval(function(){ loadFeeds(); }, 60*1000);
}

/* Invoked by Initialize */
function loadLinks(){
	var rawL = "<li><a href='{0}'>{1}</a>&nbsp;<img src='{2}' width='16' height='16' alt=''></li>";
	var rawR = "<li><img src='{2}' width='16' height='16' alt=''> &nbsp;<a href='{0}'>{1}</a></li>";
	var linkL = "";
	var linkR = "";
	
	//Build linklists
	if(settings.data.LinkL1v)
		linkL += String.format(rawL, settings.data.LinkL1l, settings.data.LinkL1d, getFavicon(settings.data.LinkL1l));
	if(settings.data.LinkL2v)
		linkL += String.format(rawL, settings.data.LinkL2l, settings.data.LinkL2d, getFavicon(settings.data.LinkL2l));
	if(settings.data.LinkL3v)
		linkL += String.format(rawL, settings.data.LinkL3l, settings.data.LinkL3d, getFavicon(settings.data.LinkL3l));
	if(settings.data.LinkL4v)
		linkL += String.format(rawL, settings.data.LinkL4l, settings.data.LinkL4d, getFavicon(settings.data.LinkL4l));
	
	if(settings.data.LinkR1v)
		linkR += String.format(rawR, settings.data.LinkR1l, settings.data.LinkR1d, getFavicon(settings.data.LinkR1l));
	if(settings.data.LinkR2v)
		linkR += String.format(rawR, settings.data.LinkR2l, settings.data.LinkR2d, getFavicon(settings.data.LinkR2l));
	if(settings.data.LinkR3v)
		linkR += String.format(rawR, settings.data.LinkR3l, settings.data.LinkR3d, getFavicon(settings.data.LinkR3l));
	if(settings.data.LinkR4v)
		linkR += String.format(rawR, settings.data.LinkR4l, settings.data.LinkR4d, getFavicon(settings.data.LinkR4l));
	
	//Populate page
	$("ul#linksL").html(linkL);
	$("ul#linksR").html(linkR);
}


/* Invoked by Initialize */
function loadFeeds(){
	// Clear existing data
	feedData.length = 0;
	$("ul#feeds").css("display", "none");
	$("ul#spinner").css("display", "inherit");
	
	// Get data
	if(settings.data.FeedBluesky)		loadBluesky();
	if(settings.data.FeedReddit)		loadReddit();
	if(settings.data.FeedSlashdot)		loadSlashdot();
	if(settings.data.FeedTagesschau)	loadTagesschau();
	if(settings.data.FeedEasternsun)	loadEasternsun();
	if(settings.data.FeedPlanetDebian)	loadPlanetDebian();
	if(settings.data.FeedWowhead)		loadWowhead();
	if(settings.data.FeedConnections)	loadConnections();
	if(settings.data.FeedZunder)		loadZunder();

	// Update timestamp only after 10 seconds, to avoid "throwing updates away"
	var _delay = 10*1000;
	setTimeout(function(){
		settings.updateTimestamp(Date.now() - _delay);
	}, _delay);
}


/* To be called after data has been retrieved */
function updateContent(){
	// Copy data to avoid race-conditions
	var data = feedData;
	
	// Sort items
	do{
		var swapped = false;
		for(let i=0; i<data.length-1; i++){
			if(data[i]['timestamp'] < data[i+1]['timestamp']){
				var swap = data[i];
				data[i] = data[i+1];
				data[i+1] = swap;
				swapped = true;
			}
		}
	}while(swapped);
	
	// Parse data
	var output = "";
	for(let i=0; i<data.length; i++){
		if(data[i]['timestamp'] > Date.now()){ continue; } // Skip items published in the future
		var cssClass = (data[i]['timestamp'] > settings.meta.lastUpdate) ? "newitem" : "olditem";
		var html = "<li class='{0}'><img src='icons/{1}' width='16' height='16' alt='' />&nbsp;<a href='{2}'>{3}</a></li>";
		output += String.format(html, cssClass, data[i]['icon'], data[i]['link'], data[i]['value']);
	}
	
	// Inject into page
	$("ul#feeds").html(output);
	$("ul#spinner").css("display", "none");
	$("ul#feeds").css("display", "inherit");
}


/*
 * Functions for loading data
 */

function loadWeather(){
	var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var _coord = settings.data.WeatherLoc.split(",");
	var _tempunit = (settings.data.WeatherUnit == "c") ? "celsius" : "fahrenheit";
	var _url = "https://api.open-meteo.com/v1/forecast?latitude={0}&longitude={1}&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max&temperature_unit={2}&timeformat=unixtime&timezone=auto"
	$.ajax({
		'accepts': "application/json",
		'url': 		String.format(_url, _coord[0].trim(), _coord[1].trim(), _tempunit),
		'error':	 function(error){ $("#weather").html('<p>'+error+'</p>'); }
	}).done(function(weather){
			var html = "<h2><i class='icon-{0}' title='{1}'></i> {2}&deg;{3}</h2><ul class='forecast'>";
			var _tempunit = weather.daily_units.temperature_2m_max.substring(1);
			var _html = String.format(html, translateWeathercode(weather.hourly.weathercode[0]).icon, translateWeathercode(weather.hourly.weathercode[0]).descr, Math.round(weather.hourly.temperature_2m[0]), _tempunit);
			for(var i=1;i<Math.min(6,weather.daily.weathercode.length);i++) {
				html = "<li><i class='icon-{0}' style='font-size:2.5em' title='{1}'></i> {2}&deg;{3}</li>";
				let __icon = translateWeathercode(weather.daily.weathercode[i]).icon;
				let __descr = translateWeathercode(weather.daily.weathercode[i]).descr;
				let __title = weekdays[(new Date(weather.daily.time[i]*1000)).getDay()] + ": " + __descr;
				let __temp = Math.round(weather.daily.temperature_2m_max[i]);
				_html += String.format(html, __icon, __title, __temp, _tempunit);
			}
			_html += '</ul>';
			$("#weather").html(_html);
	});
}

function loadBluesky(){
	// Sanity Check
	if(!settings.data.FeedBlueskyIdentifier || settings.data.FeedBlueskyIdentifier.length < 3
	|| !settings.data.FeedBlueskyPassword || settings.data.FeedBlueskyPassword.length < 8
	|| !settings.data.FeedBlueskyHost || settings.data.FeedBlueskyHost.length < 10){
		console.log("Bluesky Feed not properly configured!");
		return;
	}
	// Authenticate and Get Feed-URL
	const authUrl = settings.data.FeedBlueskyHost + "/xrpc/com.atproto.server.createSession";
	const feedUrl = settings.data.FeedBlueskyHost + "/xrpc/app.bsky.feed.getTimeline?limit=20";
	$.ajax({
		method:		"POST",
		url:		authUrl,
		dataType:	"json",
		contentType: "application/json",
		data:		JSON.stringify({
			"identifier": settings.data.FeedBlueskyIdentifier,
			"password": settings.data.FeedBlueskyPassword
		}),
		success: function(authData){
			// Get Feed
			$.ajax({
				method:		"GET",
				dataType:	"json",
				url:		feedUrl,
				headers:	{ "Authorization": "Bearer " + authData.accessJwt },
				success: function(data){
					// Parse Posts
					$.each(data.feed, function(i, post) {
						console.log(post.post);
						feedData.push({
							icon: "bluesky.png",
							timestamp: (new Date(post.post.record.createdAt)).getTime(),
							link: "https://bsky.social/profile/" + post.post.author.handle + "/post/" + post.post.cid,
							value: $("<div>").html(post.post.record.text).text()
						});
					});
					updateContent();
				}
			});
		}
	});
}

function loadReddit(){
	// Sanity Check
	if(!settings.data.FeedRedditUrl || settings.data.FeedRedditUrl.length < 10){
		console.log("Reddit Feed URL not set!");
		return;
	}
	// Get Threads
	$.ajax({
		dataType:	"json",
		url:		settings.data.FeedRedditUrl,
		success: function(data){
			$.each(data.data.children, function(i, thread) {
				feedData.push({
					icon: "reddit.png",
					timestamp: thread.data.created_utc * 1000,
					link: "https://www.reddit.com/"+ thread.data.permalink,
					value: thread.data.title
				});
			});
			updateContent();
		},
		error: function(data){ console.log(data); }
	});
}

function loadSlashdot(){
	parseRSS("https://rss.slashdot.org/Slashdot/slashdotMain", function(slashdotData) {
		$.each(slashdotData, function(i, entry){
			feedData.push({
				icon: "slashdot.png",
				timestamp: (new Date(entry.date)).getTime(),
				link: entry.link,
				value: entry.title
			});
		});
		updateContent();
	});
}

function loadTagesschau(){
	parseRSS("https://www.tagesschau.de/xml/rss2", function(tagesschauData) {
		$.each(tagesschauData, function(i, entry){
			feedData.push({
				icon: "tagesschau.ico",
				timestamp: (new Date(entry.pubDate)).getTime(),
				link: entry.link,
				value: entry.title
			});
		});
		updateContent();
	});
}

function loadEasternsun(){
	parseRSS("http://easternsun.de/forum/app.php/feed", function(easternsunData) {
		$.each(easternsunData, function(i, post){
			var _title = (post.title).substring((post.title).indexOf("•")+2, (post.title).length);
			feedData.push({
				icon: "easternsun.png",
				timestamp: (new Date(post.updated)).getTime(),
				link: post.href,
				value: _title
			});
		});
		updateContent();
	});
}

function loadPlanetDebian(){
	parseRSS("https://planet.debian.org/atom.xml", function(planetDebianData) {
		$.each(planetDebianData, function(i, post){
			feedData.push({
				icon: "planetDebian.ico",
				timestamp: (new Date(post.updated)).getTime(),
				link: post.href,
				value: post.title
			});
		});
		updateContent();
	});
}

function loadWowhead(){
	parseRSS("https://www.wowhead.com/news/rss/all", function(wowheadData) {
		$.each(wowheadData, function(i, post){
			feedData.push({
				icon: "wowhead.ico",
				timestamp: (new Date(post.pubDate)).getTime(),
				link: post.guid,
				value: post.title
			});
		});
		updateContent();
	});
}

function loadConnections(){
	$.ajax({
		dataType:	"json",
		url:		"https://connect.bosch.com/connections/opensocial/basic/rest/activitystreams/@me/@all/@all?shortStrings=true&rollup=true&format=json",
		success: function(data){
			$(data.list).each(function(i, item){
				feedData.push({
					icon: "bosch.png",
					timestamp: (new Date(item.updated)).getTime(),
					link: item.object.url,
					value: $("<div>").html(item.connections.plainTitle).text()
				});
			});
			updateContent();
		},
		error: function(data){ console.log(data); }
	});
}

function loadZunder(){
	$.ajax({
		dataType:	"json",
		url:		"https://inside-ws.bosch.com/bgnnewsservice/en/articles/?sortField=creationDate&sortOrder=DESC&articlesFilter=ONLY_NEWS_ARTICLES&size=18",
		success: function(data){
			$.each(data, function(i, item){
				feedData.push({
					icon: "bosch.png",
					timestamp: (new Date(item.creationDate)).getTime(),
					link: "http://bzo.bosch.com" + item.url,
					value: item.headline
				});
			});
			updateContent();
		},
		error: function(data){ console.log(data); }
	});
}


/*
 * Helper Functions
 */

function parseRSS(url, callback) {
	fetch(url)
		.then(response => response.text())
		.then(text => {
			var data = new DOMParser().parseFromString(text, "text/xml");
			var _data = new Array();
			$(["entry", "item", "post"]).each(function(_, key){
				$(data).find(key).each(function(_, item){
					var _item = {
						title:		$(item).find("title").text(),
						href:		$(item).find("link").attr("href"),
						link:		$(item).find("link").text(),
						guid:		$(item).find("guid").text(),
						pubDate:	$(item).find("pubDate").text(),
						updated:	$(item).find("updated").text(),
						date:		$(item).find("dc\\:date").text()
					};
					_data.push(_item);
				});
			});
			callback(_data);
		})
		.catch(error => { console.log(error); });
}

function getFavicon(url){
	var favicon = "http://www.google.com/s2/favicons?domain=";
	var urlParts = (url.replace('http://','')).replace('https://','').split(/[/?#]/); //extract domain --> [0]
	if (urlParts[0].endsWith('.bosch.com') || urlParts[0].endsWith('.boschdevcloud.com')) {
		return "icons/bosch.png";
	}
	return favicon.concat(urlParts[0]);
}

String.format = function() {
	var s = arguments[0];
	for (var i = 0; i < arguments.length - 1; i++) {
		var reg = new RegExp("\\{" + i + "\\}", "gm");
		s = s.replace(reg, arguments[i + 1]);
	}
	return s;
}

function translateWeathercode(weathercode){
	var _weather = {"icon": "star", "descr": "Unknown"};
	switch(weathercode){
		case 0:		_weather.icon = "1"; _weather.descr = "Clear sky"; break;
		case 1:		_weather.icon = "2"; _weather.descr = "Mainly clear"; break;
		case 2:		_weather.icon = "A"; _weather.descr = "Partly cloudy"; break;
		case 3:		_weather.icon = "3"; _weather.descr = "Overcast"; break;
		case 45:	_weather.icon = "B"; _weather.descr = "Fog"; break;
		case 48:	_weather.icon = "Z"; _weather.descr = "Depositing rime fog"; break;
		case 51:	_weather.icon = "F"; _weather.descr = "Light drizzle"; break;
		case 53:	_weather.icon = "G"; _weather.descr = "Drizzle"; break;
		case 55:	_weather.icon = "G"; _weather.descr = "Dense drizzle"; break;
		case 56:	_weather.icon = "L"; _weather.descr = "Light freezing drizzle"; break;
		case 57:	_weather.icon = "M"; _weather.descr = "Dense freezing drizzle"; break;
		case 61:	_weather.icon = "J"; _weather.descr = "Slight rain"; break;
		case 63:	_weather.icon = "K"; _weather.descr = "Rain"; break;
		case 65:	_weather.icon = "K"; _weather.descr = "Heavy rain"; break;
		case 66:	_weather.icon = "V"; _weather.descr = "Light freezing rain"; break;
		case 67:	_weather.icon = "W"; _weather.descr = "Heavy freezing rain"; break;
		case 71:	_weather.icon = "H"; _weather.descr = "Slight snowfall"; break;
		case 73:	_weather.icon = "I"; _weather.descr = "Snowfall"; break;
		case 75:	_weather.icon = "I"; _weather.descr = "Heavy snowfall"; break;
		case 77:	_weather.icon = "I"; _weather.descr = "Snow grains"; break;
		case 80:	_weather.icon = "T"; _weather.descr = "Slight showers"; break;
		case 81:	_weather.icon = "U"; _weather.descr = "Showers"; break;
		case 82:	_weather.icon = "U"; _weather.descr = "Violent showers"; break;
		case 85:	_weather.icon = "V"; _weather.descr = "Slight snow showers"; break;
		case 86:	_weather.icon = "W"; _weather.descr = "Heavy snow showers"; break;
		case 95:	_weather.icon = "S"; _weather.descr = "Thunderstorms"; break;
		case 96:	_weather.icon = "P"; _weather.descr = "Thunderstorms with slight hail"; break;
		case 99:	_weather.icon = "Q"; _weather.descr = "Thunderstorms with heavy hail"; break;
	}
	return _weather;
}