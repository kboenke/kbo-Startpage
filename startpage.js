document.addEventListener('DOMContentLoaded', initialize, false);
window.addEventListener('unload', function(object){
	chrome.storage.sync.set({'kboStartpage_lastUpdate': Date.now()}, function(){});
console.log('Poof');
});


var feedData = [];
var kboLastUpdate = 0;
var kboConfig;

/* To be called after page is loaded */
function initialize(){
	// Load Options
	chrome.storage.sync.get({
		WeatherID:		'Miami Beach, FL',
		WeatherUnit:	'f',
		LinkL1v:		false,
		LinkL2v:		false,
		LinkL3v:		false,
		LinkL4v:		false,
		LinkR1v:		false,
		LinkR2v:		false,
		LinkR3v:		false,
		LinkR4v:		false,
		LinkL1l:		'',
		LinkL1d:		'',
		LinkL2l:		'',
		LinkL2d:		'',
		LinkL3l:		'',
		LinkL3d:		'',
		LinkL4l:		'',
		LinkL4d:		'',
		LinkR1l:		'',
		LinkR1d:		'',
		LinkR2l:		'',
		LinkR2d:		'',
		LinkR3l:		'',
		LinkR3d:		'',
		LinkR4l:		'',
		LinkR4d:		'',
		FeedPlanetDebian:	true,
		FeedReddit:		false,
		FeedRedditUrl:	'',
		FeedTagesschau:	true,
		FeedTwitter:	false,
		FeedTwitterKey:			'',
		FeedTwitterSecret:		'',
		FeedTwitterToken:		'',
		FeedTwitterTokenSecret:	''
	}, function(items){
		kboConfig = {
			WeatherID:		items.WeatherID,
			WeatherUnit:	items.WeatherUnit,
			LinkL1v:		items.LinkL1v,
			LinkL2v:		items.LinkL2v,
			LinkL3v:		items.LinkL3v,
			LinkL4v:		items.LinkL4v,
			LinkR1v:		items.LinkR1v,
			LinkR2v:		items.LinkR2v,
			LinkR3v:		items.LinkR3v,
			LinkR4v:		items.LinkR4v,
			LinkL1l:		items.LinkL1l,
			LinkL1d:		items.LinkL1d,
			LinkL2l:		items.LinkL2l,
			LinkL2d:		items.LinkL2d,
			LinkL3l:		items.LinkL3l,
			LinkL3d:		items.LinkL3d,
			LinkL4l:		items.LinkL4l,
			LinkL4d:		items.LinkL4d,
			LinkR1l:		items.LinkR1l,
			LinkR1d:		items.LinkR1d,
			LinkR2l:		items.LinkR2l,
			LinkR2d:		items.LinkR2d,
			LinkR3l:		items.LinkR3l,
			LinkR3d:		items.LinkR3d,
			LinkR4l:		items.LinkR4l,
			LinkR4d:		items.LinkR4d,
			FeedEasternsun:			items.FeedEasternsun,
			FeedReddit:				items.FeedReddit,
			FeedRedditUrl:			items.FeedRedditUrl,
			FeedTagesschau:			items.FeedTagesschau,
			FeedTwitter:			items.FeedTwitter,
			FeedTwitterKey:			items.FeedTwitterKey,
			FeedTwitterSecret:		items.FeedTwitterSecret,
			FeedTwitterToken:		items.FeedTwitterToken,
			FeedTwitterTokenSecret:	items.FeedTwitterTokenSecret
		};
		//Populate page
		loadWeather();
		loadLinks();
console.log(kboConfig);
		
		// Attempt restore of last update
		chrome.storage.sync.get('kboStartpage_lastUpdate', function(storedData){
			if(storedData.kboStartpage_lastUpdate > 0){
				kboLastUpdate = storedData.kboStartpage_lastUpdate;
			}
			loadFeeds();
		});
	});
}

/* Invoked by Initialize */
function loadLinks(){
	rawL = '<li><a href="{link}">{desc}</a>&nbsp;<img src="http://www.google.com/s2/favicons?domain={domain}" width=\'16\' height=\'16\'></li>';
	rawR = '<li><img src="http://www.google.com/s2/favicons?domain={domain}" width=\'16\' height=\'16\'>&nbsp;<a href="{link}">{desc}</a></li>';
	linkL = "";
	linkR = "";
	
	//Build linklists
	if(kboConfig['LinkL1v']){
		urlParts = (kboConfig['LinkL1l'].replace('http://','')).replace('https://','').split(/[/?#]/); //extract domain --> [0]
		linkBuilder = ((rawL.replace("{link}", kboConfig['LinkL1l'])).replace("{desc}", kboConfig['LinkL1d'])).replace("{domain}", urlParts[0]);
		linkL+= linkBuilder;
	}
	if(kboConfig['LinkL2v']){
		urlParts = (kboConfig['LinkL2l'].replace('http://','')).replace('https://','').split(/[/?#]/); //extract domain --> [0]
		linkBuilder = ((rawL.replace("{link}", kboConfig['LinkL2l'])).replace("{desc}", kboConfig['LinkL2d'])).replace("{domain}", urlParts[0]);
		linkL+= linkBuilder;
	}
	if(kboConfig['LinkL3v']){
		urlParts = (kboConfig['LinkL3l'].replace('http://','')).replace('https://','').split(/[/?#]/); //extract domain --> [0]
		linkBuilder = ((rawL.replace("{link}", kboConfig['LinkL3l'])).replace("{desc}", kboConfig['LinkL3d'])).replace("{domain}", urlParts[0]);
		linkL+= linkBuilder;
	}
	if(kboConfig['LinkL4v']){
		urlParts = (kboConfig['LinkL4l'].replace('http://','')).replace('https://','').split(/[/?#]/); //extract domain --> [0]
		linkBuilder = ((rawL.replace("{link}", kboConfig['LinkL4l'])).replace("{desc}", kboConfig['LinkL4d'])).replace("{domain}", urlParts[0]);
		linkL+= linkBuilder;
	}
	
	if(kboConfig['LinkR1v']){
		urlParts = (kboConfig['LinkR1l'].replace('http://','')).replace('https://','').split(/[/?#]/); //extract domain --> [0]
		linkBuilder = ((rawR.replace("{link}", kboConfig['LinkR1l'])).replace("{desc}", kboConfig['LinkR1d'])).replace("{domain}", urlParts[0]);
		linkR+= linkBuilder;
	}
	if(kboConfig['LinkR2v']){
		urlParts = (kboConfig['LinkR2l'].replace('http://','')).replace('https://','').split(/[/?#]/); //extract domain --> [0]
		linkBuilder = ((rawR.replace("{link}", kboConfig['LinkR2l'])).replace("{desc}", kboConfig['LinkR2d'])).replace("{domain}", urlParts[0]);
		linkR+= linkBuilder;
	}
	if(kboConfig['LinkR3v']){
		urlParts = (kboConfig['LinkR3l'].replace('http://','')).replace('https://','').split(/[/?#]/); //extract domain --> [0]
		linkBuilder = ((rawR.replace("{link}", kboConfig['LinkR3l'])).replace("{desc}", kboConfig['LinkR3d'])).replace("{domain}", urlParts[0]);
		linkR+= linkBuilder;
	}
	if(kboConfig['LinkR4v']){
		urlParts = (kboConfig['LinkR4l'].replace('http://','')).replace('https://','').split(/[/?#]/); //extract domain --> [0]
		linkBuilder = ((rawR.replace("{link}", kboConfig['LinkR4l'])).replace("{desc}", kboConfig['LinkR4d'])).replace("{domain}", urlParts[0]);
		linkR+= linkBuilder;
	}
	
	//Populate page
	document.getElementById('linksL').innerHTML = linkL;
	document.getElementById('linksR').innerHTML = linkR;
}


/* Invoked by Initialize */
function loadFeeds(){
	// Clear existing data
	feedData = [];
	document.getElementById("feeds").innerHTML = "<div id=\"loading\"><img src=\"loading.gif\" class=\"loading\" /></div>";
	
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
	
	// Limit output
//	data = data.splice(0,40);
	
	// Parse data
	var output = "";
	for(i=0; i<data.length; i++){
		cssClass = (data[i]['timestamp'] > kboLastUpdate) ? "newitem" : "olditem";
		output += "<li class=\""+ cssClass +"\"><img src=icons/"+ data[i]['icon'] +" width='16' height='16' />&nbsp;<a href=\""+ data[i]['link'] +"\">"+ data[i]['value'] +"</a></li>";
	}
	
	// Inject into page
	document.getElementById("feeds").innerHTML = output;
}


/*
 * Function for loading data
 */
function loadTwitter(){
	twitterURL =			"https://api.twitter.com/1.1/statuses/home_timeline.json";
//	twitterURL =			"https://api.twitter.com/oauth/request_token";
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
	twitterSignatureBase =	twitterURLmethod +"&"+ encodeURIComponent(twitterURL) +"&"+ encodeURIComponent(twitterParameter.join("&"));
	twitterSignatureKey =	encodeURIComponent(twitterSecret) +"&"+ encodeURIComponent(twitterTokenSecret);
	twitterSignature =		encodeURIComponent(CryptoJS.HmacSHA1(twitterSignatureBase, twitterSignatureKey).toString(CryptoJS.enc.Base64));
	
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
		$.each(tagesschauData.entries, function(i, entry){
			feedData.push({
				icon: "tagesschau.ico",
				timestamp: (new Date(entry.publishedDate)).getTime(),
				link: entry.link,
				value: entry.title
			});
		});
		updateContent();
	});
}

function loadEasternsun(){
	parseRSS("http://easternsun.de/forum/feed.php?mode=topics", function(easternsunData) {
console.log(easternsunData);
		$.each(easternsunData.entries, function(i, post){
			feedData.push({
				icon: "easternsun.png",
				timestamp: (new Date(post.published)).getTime(),
				link: post.link,
				value: post.title
			});
		});
		updateContent();
	});
}

function loadPlanetDebian(){
	parseRSS("http://planet.debian.org/atom.xml", function(planetDebianData) {
		$.each(planetDebianData.entries, function(i, post){
			feedData.push({
				icon: "planetDebian.ico",
				timestamp: (new Date(post.publishedDate)).getTime(),
				link: post.link,
				value: post.title
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
		url: 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&num=20&q=' + encodeURIComponent(url),
//		url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%20in%20(select%20title%20from%20atom%20where%20url%3D'"+ encodeURIComponent(url) +"')&format=json&callback=",
		dataType: 'json',
		success: function(data) {
			callback(data.responseData.feed);
		}
	});
}

function getNonce(length) {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for(var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

/*
 * Weather
 */

function loadWeather(){
	$.simpleWeather({
		location: kboConfig['WeatherID'],
		woeid: '',
		unit: kboConfig['WeatherUnit'],
		success: function(weather) {
			html = '<h2><i class="icon-'+weather.code+'" title="'+kboConfig['WeatherID']+'"></i> '+weather.temp+'&deg;'+weather.units.temp+'</h2>';
			html += '<ul>';
			for(var i=1;i<Math.min(6,weather.forecast.length);i++) {
				html += '<li><i class="icon-'+weather.forecast[i].code+'" style="font-size:2.5em"></i> '+weather.forecast[i].high+'&deg;'+weather.units.temp+'</li>';
			}
			html += '</ul>';
			$("#weather").html(html);
		},
		error: function(error) {
			$("#weather").html('<p>'+error+'</p>');
		}
	});
}
