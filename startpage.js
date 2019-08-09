document.addEventListener('DOMContentLoaded', initialize, false);
var feedData = [];
var kboLastUpdate = 0;
var kboConfig;

/* To be called after page is loaded */
function initialize(){
	// Load Options
	chrome.storage.sync.get({
		WeatherLoc:				'25.867377,-80.120379',
		WeatherUnit:			'f',
		WeatherApiKey:			'', 
		LinkL1v:				false,
		LinkL2v:				false,
		LinkL3v:				false,
		LinkL4v:				false,
		LinkR1v:				false,
		LinkR2v:				false,
		LinkR3v:				false,
		LinkR4v:				false,
		LinkL1l:				'',
		LinkL1d:				'',
		LinkL2l:				'',
		LinkL2d:				'',
		LinkL3l:				'',
		LinkL3d:				'',
		LinkL4l:				'',
		LinkL4d:				'',
		LinkR1l:				'',
		LinkR1d:				'',
		LinkR2l:				'',
		LinkR2d:				'',
		LinkR3l:				'',
		LinkR3d:				'',
		LinkR4l:				'',
		LinkR4d:				'',
		FeedEasternsun:			false,
		FeedPlanetDebian:		true,
		FeedReddit:				false,
		FeedRedditUrl:			'',
		FeedTagesschau:			true,
		FeedTwitter:			false,
		FeedTwitterKey:			'',
		FeedTwitterSecret:		'',
		FeedTwitterToken:		'',
		FeedTwitterTokenSecret:	'',
		FeedWowhead:			false,
		FeedConnections:		false,
		FeedZunder:				false
	}, function(items){
		kboConfig = {
			WeatherLoc:				items.WeatherLoc,
			WeatherUnit:			items.WeatherUnit,
			WeatherApiKey:			items.WeatherApiKey,
			LinkL1v:				items.LinkL1v,
			LinkL2v:				items.LinkL2v,
			LinkL3v:				items.LinkL3v,
			LinkL4v:				items.LinkL4v,
			LinkR1v:				items.LinkR1v,
			LinkR2v:				items.LinkR2v,
			LinkR3v:				items.LinkR3v,
			LinkR4v:				items.LinkR4v,
			LinkL1l:				items.LinkL1l,
			LinkL1d:				items.LinkL1d,
			LinkL2l:				items.LinkL2l,
			LinkL2d:				items.LinkL2d,
			LinkL3l:				items.LinkL3l,
			LinkL3d:				items.LinkL3d,
			LinkL4l:				items.LinkL4l,
			LinkL4d:				items.LinkL4d,
			LinkR1l:				items.LinkR1l,
			LinkR1d:				items.LinkR1d,
			LinkR2l:				items.LinkR2l,
			LinkR2d:				items.LinkR2d,
			LinkR3l:				items.LinkR3l,
			LinkR3d:				items.LinkR3d,
			LinkR4l:				items.LinkR4l,
			LinkR4d:				items.LinkR4d,
			FeedEasternsun:			items.FeedEasternsun,
			FeedPlanetDebian:		items.FeedPlanetDebian,
			FeedReddit:				items.FeedReddit,
			FeedRedditUrl:			items.FeedRedditUrl,
			FeedTagesschau:			items.FeedTagesschau,
			FeedTwitter:			items.FeedTwitter,
			FeedTwitterKey:			items.FeedTwitterKey,
			FeedTwitterSecret:		items.FeedTwitterSecret,
			FeedTwitterToken:		items.FeedTwitterToken,
			FeedTwitterTokenSecret:	items.FeedTwitterTokenSecret,
			FeedWowhead:			items.FeedWowhead,
			FeedWowheadUrl:			items.FeedWowheadUrl,
			FeedConnections:		items.FeedConnections,
			FeedZunder:				items.FeedZunder,
		};
		
		//Trigger Darkmode
		chrome.storage.local.get({kboStartpage_darkmode: false}, function(storedData){
			if(storedData.kboStartpage_darkmode === true){
				$("head").append("<link rel='stylesheet' id='extracss' href='startpage_dark.css' type='text/css' />");
			}
		});
		
		//Populate page
		loadWeather();
		loadLinks();
		
		// Attempt restore of last update
		chrome.storage.local.get('kboStartpage_lastUpdate', function(storedData){
			if(storedData.kboStartpage_lastUpdate > 0)
				kboLastUpdate = storedData.kboStartpage_lastUpdate;
			console.log("Last update was " + ((Date.now() - kboLastUpdate)/1000).toFixed(0) + " seconds ago.");
			loadFeeds();
		});
	});
}

/* Invoked by Initialize */
function loadLinks(){
	rawL = "<li><a href='{0}'>{1}</a>&nbsp;<img src='{2}' width='16' height='16' alt='' \></li>";
	rawR = "<li><img src='{2}' width='16' height='16' alt='' \>&nbsp;<a href='{0}'>{1}</a></li>";
	linkL = "";
	linkR = "";
	
	//Build linklists
	if(kboConfig['LinkL1v'])
		linkL += String.format(rawL, kboConfig['LinkL1l'], kboConfig['LinkL1d'], getFavicon(kboConfig['LinkL1l']));
	if(kboConfig['LinkL2v'])
		linkL += String.format(rawL, kboConfig['LinkL2l'], kboConfig['LinkL2d'], getFavicon(kboConfig['LinkL2l']));
	if(kboConfig['LinkL3v'])
		linkL += String.format(rawL, kboConfig['LinkL3l'], kboConfig['LinkL3d'], getFavicon(kboConfig['LinkL3l']));
	if(kboConfig['LinkL4v'])
		linkL += String.format(rawL, kboConfig['LinkL4l'], kboConfig['LinkL4d'], getFavicon(kboConfig['LinkL4l']));
	
	if(kboConfig['LinkR1v'])
		linkR += String.format(rawR, kboConfig['LinkR1l'], kboConfig['LinkR1d'], getFavicon(kboConfig['LinkR1l']));
	if(kboConfig['LinkR2v'])
		linkR += String.format(rawR, kboConfig['LinkR2l'], kboConfig['LinkR2d'], getFavicon(kboConfig['LinkR2l']));
	if(kboConfig['LinkR3v'])
		linkR += String.format(rawR, kboConfig['LinkR3l'], kboConfig['LinkR3d'], getFavicon(kboConfig['LinkR3l']));
	if(kboConfig['LinkR4v'])
		linkR += String.format(rawR, kboConfig['LinkR4l'], kboConfig['LinkR4d'], getFavicon(kboConfig['LinkR4l']));
	
	//Populate page
	$("ul#linksL").html(linkL);
	$("ul#linksR").html(linkR);
}


/* Invoked by Initialize */
function loadFeeds(){
	// Clear existing data
	feedData = [];
	$("ul#feeds").css("display", "none");
	$("ul#spinner").css("display", "inherit");
	
	// Get data
	if(kboConfig['FeedTwitter'])
		loadTwitter();
	if(kboConfig['FeedReddit'])
		loadReddit();
	if(kboConfig['FeedTagesschau'])
		loadTagesschau();
	if(kboConfig['FeedEasternsun'])
		loadEasternsun();
	if(kboConfig['FeedPlanetDebian'])
		loadPlanetDebian();
	if(kboConfig['FeedWowhead'])
		loadWowhead();
	if(kboConfig['FeedConnections'])
		loadConnections();
	if(kboConfig['FeedZunder'])
		loadZunder();
}


/* To be called after data has been retrieved */
function updateContent(){
	// Copy data to avoid race-conditions
	data = feedData;
	
	// Sort items
	do{
		var swapped = false;
		for(i=0; i<data.length-1; i++){
			if(data[i]['timestamp'] < data[i+1]['timestamp']){
				var swap = data[i];
				data[i] = data[i+1];
				data[i+1] = swap;
				swapped = true;
			}
		}
	}while(swapped != false);
	
	// Parse data
	var output = "";
	for(i=0; i<data.length; i++){
		if(data[i]['timestamp'] > Date.now()){ continue; } // Skip items published in the future
		cssClass = (data[i]['timestamp'] > kboLastUpdate) ? "newitem" : "olditem";
		html = "<li class='{0}'><img src='icons/{1}' width='16' height='16' alt='' />&nbsp;<a href='{2}'>{3}</a></li>";
		output += String.format(html, cssClass, data[i]['icon'], data[i]['link'], data[i]['value']);
	}
	
	// Inject into page
	$("ul#spinner").css("display", "none");
	$("ul#feeds").css("display", "inherit");
	$("ul#feeds").html(output);
	
	// Save current timestamp for next page-load (60 seconds grace-period)
	if((kboLastUpdate + (60*1000)) < Date.now())
		chrome.storage.local.set({'kboStartpage_lastUpdate': Date.now()}, function(){});
}


/*
 * Functions for loading data
 */

function loadWeather(){
	weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	$.simplerWeather({
		location: kboConfig['WeatherLoc'],
		units: kboConfig['WeatherUnit'],
		apikey: kboConfig['WeatherApiKey'],
		forecast: true,
		forecastdays: 6,
		success: function(weather) {
			html = "<h2><i class='icon-{0}' title='{1}'></i> {2}&deg;{3}</h2><ul class='forecast'>";
			_html = String.format(html, weather.icon, weather.currently, Math.round(weather.temp), weather.unit.toUpperCase());
			for(var i=1;i<Math.min(6,weather.forecast.length);i++) {
				title = weekdays[(new Date(weather.forecast[i].date*1000)).getDay()] + ": " + weather.forecast[i].summary;
				html = "<li><i class='icon-{0}' style='font-size:2.5em' title='{1}'></i> {2}&deg;{3}</li>";
				_html += String.format(html, weather.forecast[i].icon, title, Math.round(weather.forecast[i].high), weather.unit.toUpperCase());
			}
			_html += '</ul>';
			$("#weather").html(_html);
		},
		error: function(error) { $("#weather").html('<p>'+error+'</p>'); }
	});
}

function loadTwitter(){
	twitterURL =			"https://api.twitter.com/1.1/statuses/home_timeline.json";
	//twitterURL =			"https://api.twitter.com/oauth/request_token";
	twitterURLmethod =		"GET",
	twitterKey =			kboConfig['FeedTwitterKey'];
	twitterSecret =			kboConfig['FeedTwitterSecret'];
	twitterToken =			kboConfig['FeedTwitterToken'];
	twitterTokenSecret =	kboConfig['FeedTwitterTokenSecret'];
	twitterNonce =			getNonce(32);
	twitterTimestamp =		Math.round(Date.now()/1000);

	// Generate oAuth Signature (https://dev.twitter.com/oauth/overview/creating-signatures)
	twitterParameter = [
		encodeURI('oauth_consumer_key='+twitterKey),
		encodeURI('oauth_nonce='+twitterNonce),
		encodeURI('oauth_signature_method='+"HMAC-SHA1"),
		encodeURI('oauth_timestamp='+twitterTimestamp),
		encodeURI('oauth_token='+twitterToken),
		encodeURI('oauth_version='+"1.0")
	];
	twitterParameter.sort();
	twitterSignatureBase = twitterURLmethod +"&"+ encodeURIComponent(twitterURL) +"&"+ encodeURIComponent(twitterParameter.join("&"));
	twitterSignatureKey = encodeURIComponent(twitterSecret) +"&"+ encodeURIComponent(twitterTokenSecret);
	twitterSignature = encodeURIComponent(CryptoJS.HmacSHA1(twitterSignatureBase, twitterSignatureKey).toString(CryptoJS.enc.Base64));
	
	// Get tweets
	$.ajax({
		type:		twitterURLmethod,
		url:		twitterURL,
		headers:	{
			'Authorization': 'OAuth '+
				'oauth_consumer_key="'+ twitterKey +'", '+
				'oauth_nonce="'+ twitterNonce +'", '+
				'oauth_signature="'+ twitterSignature +'", '+
				'oauth_signature_method="HMAC-SHA1", '+
				'oauth_timestamp="'+ twitterTimestamp +'", '+
				'oauth_token="'+ twitterToken +'", '+
				'oauth_version="1.0"'
		}
	}).done(function(twitterData){
		// Retrieve tweets
		$.each(twitterData, function(i, tweet){
			feedData.push({
				icon: "twitter.png",
				timestamp: (new Date(tweet.created_at)).getTime(),
				link: "https://twitter.com/"+ tweet.user.screen_name +"/status/"+ tweet.id_str,
				value: tweet.text
			});
		});
		updateContent();
	});
}

function loadReddit(){
	// Get Threads
	$.getJSON(kboConfig['FeedRedditUrl'], function(redditData) {
		$.each(redditData.data.children, function(i, thread){
			feedData.push({
				icon: "reddit.png",
				timestamp: thread.data.created_utc * 1000,
				link: "https://www.reddit.com/"+ thread.data.permalink,
				value: thread.data.title
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
	parseRSS("https://www.wowhead.com/news%26rss", function(wowheadData) {
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
	$.getJSON("https://connect.bosch.com/connections/opensocial/basic/rest/activitystreams/@me/@all/@all?shortStrings=true&rollup=true&format=json", function(connectionsData) {
		$(connectionsData.list).each(function(i, item){
			feedData.push({
				icon: "bosch.png",
				timestamp: (new Date(item.updated)).getTime(),
				link: item.object.url,
				value: $("<div>").html(item.connections.plainTitle).text()
			});
		});
		updateContent();
	});
}

function loadZunder(){
	$.getJSON("https://inside-ws.bosch.com/bgnnewsservice/en/articles/?sortField=creationDate&sortOrder=DESC", function(zunderData) {
		$.each(zunderData, function(i, item){
			feedData.push({
				icon: "bosch.png",
				timestamp: (new Date(item.creationDate)).getTime(),
				link: "http://bzo.bosch.com/" + item.url,
				value: item.headline
			});
		});
		updateContent();
	});
}


/*
 * Helper Functions
 */

function parseRSS(url, callback) {
	$.ajax({
//		url: 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(url),
//		url: 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&num=20&q=' + encodeURIComponent(url),
//		url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%20in%20(select%20title%20from%20atom%20where%20url%3D'"+ encodeURIComponent(url) +"')&format=json&callback=",
//		dataType: 'json',
		url: url,
		success: function(data) {
			var _data = new Array();
			$(["entry", "item", "post"]).each(function(_, key){
				$(data).find(key).each(function(_, item){
					var _item = {
						title:		$(item).find("title").text(),
						href:		$(item).find("link").attr("href"),
						link:		$(item).find("link").text(),
						guid:		$(item).find("guid").text(),
						pubDate:	$(item).find("pubDate").text(),
						updated:	$(item).find("updated").text()
					};
					_data.push(_item);
				});
			});
			callback(_data);
		},
		error: function(data) { console.log(data); }
	});
}

function getNonce(length) {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for(var i = 0; i < length; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)); }
	return text;
}

function getFavicon(url){
	favicon = "http://www.google.com/s2/favicons?domain=";
	urlParts = (url.replace('http://','')).replace('https://','').split(/[/?#]/); //extract domain --> [0]
	_favicon = (urlParts[0].endsWith('bosch.com')) ? "icons/bosch.png" : favicon.concat(urlParts[0]);
	return _favicon;
}

String.format = function() {
	var s = arguments[0];
	for (var i = 0; i < arguments.length - 1; i++) {       
		var reg = new RegExp("\\{" + i + "\\}", "gm");             
		s = s.replace(reg, arguments[i + 1]);
	}
	return s;
}