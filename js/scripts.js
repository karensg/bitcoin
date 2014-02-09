// Global variables

database = new Object();
ipAddressesHashes = [];
exportIp = new Object();
ipGrouped = new Object();
heatmapData = [];
propagationLocations = [];
propagationPath = null;
propagationIps = [];

var heatmap;
markerCluster = null;
image = 'images/bitcoin.png';
mainCountryColor = "FF3943";
lineSymbol = {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
};
dayNight = new DayNightOverlay();
dayNightOn = false;

lastMarker = null;
currentOpenWindow = null;
globalMarkers = [];
globalCircles = [];

countryDB = new Object()
currentUSDprice = null;

// Execute when ready with page loading
$(document).ready(function(e) {

	// Create a log block
	$("#toggle-log").click(function() {
		$(this).parent().toggleClass("active");
		$("#log-block").fadeToggle();
		return false;
	});
	$("#close-log").click(function() {
		$("#toggle-log").click();
	});

	// Create a day-night block
	$("#toggle-day-night").click(function() {
		$(this).parent().toggleClass("active");
		toggleDayNight();
		return false;
	});

	// Create an about page
	$("#toggle-about").click(function() {
		$(this).parent().toggleClass("active");
		$("#about-page").fadeToggle();
		return false;
	});
	$("#close-about").click(function() {
		$("#toggle-about").click();
	});
	
	
	// Create Google Maps Object
	var mapOptions = {
		zoom: 3	,
		center: new google.maps.LatLng(51.37180, 13.23583)
	};
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	getCountries();
	reload();
	getData();
	
	getCurrentPrice();
	//$("#toggle-about").click();
	
});

// Reset Google Maps view after changing a hashtag
$(window).bind('hashchange', reload);

function reload() {

	mode = window.location.hash.substring(1);

	// Remove all markers
	resetAllMarkers();

	// Hide heatmap if available
	if(heatmap != undefined) {
		heatmap.setMap(null);
	}

	// Remove countries layer
	initCountries(null);

	// Remove transaction value layer
	transactionValue(null);


	switch(mode)
	{
		case "heatmap":
			initHeatmap();
			break;
		case "markers":
			initMarkers();
			break;
		case "countries":
			initCountries(map); 
			break;
		case "transaction-value":
			transactionValue(map);
			break;
		case "propagation1":
			propagationIps = ips1;
			initPropagationValue();
			break;
		case "propagation2":
			propagationIps = ips2;
			initPropagationValue();
			break;
		case "propagation3":
			propagationIps = ips3;
			initPropagationValue();
			break;
		default:
			initMarkers();
	}
}

function initPropagationValue(propagationNumber){
	
	var marker = new google.maps.Marker({
		  position: new google.maps.LatLng(propagationIps[0].lat,propagationIps[0].lon),
		  map: map,
		  title: 'First relay',
		animation: google.maps.Animation.DROP,
		icon: image
	  });
	//globalMarkers.push(marker);
	setTimeout(function(){addPropagationValue(0)},1500);

}

function addPropagationValue(i){
	
	//console.log(ips1[i]);
	if(i < propagationIps.length && i < 100){
		latlong = new google.maps.LatLng(propagationIps[i].lat,propagationIps[i].lon);
		console.log(propagationLocations.length);
		if(propagationLocations.length > 3)
		{
			propagationLocations.shift();
		}
		propagationLocations.push(latlong);
		
		setPropagation();
		
		i++;
		setTimeout(function(){addPropagationValue(i)},1500);
	}
	
	
	
		
}

function setPropagation(){
	console.log(propagationLocations);
	if(propagationPath){
		propagationPath.setMap(null);
	}
	propagationPath = new google.maps.Polyline({
		path: propagationLocations,
		geodesic: true,
		strokeColor: '#FF0000',
		strokeOpacity: 0.8,
		strokeWeight: 1,
		icons: [{
		  icon: lineSymbol,
		  offset: '100%'
		}]
	});		
  	propagationPath.setMap(map);
}



function initHeatmap() {
	
	heatmap = new google.maps.visualization.HeatmapLayer({
		data: heatmapData,	
	});
	var gradient = [
		'rgba(0, 255, 255, 0)',
		'rgba(0, 255, 255, 1)',
		'rgba(0, 191, 255, 1)',
		'rgba(0, 127, 255, 1)',
		'rgba(0, 63, 255, 1)',
		'rgba(0, 0, 255, 1)',
		'rgba(0, 0, 223, 1)',
		'rgba(0, 0, 191, 1)',
		'rgba(0, 0, 159, 1)',
		'rgba(0, 0, 127, 1)',
		'rgba(63, 0, 91, 1)',
		'rgba(127, 0, 63, 1)',
		'rgba(191, 0, 31, 1)',
		'rgba(255, 0, 0, 1)'
	];

	heatmap.set('gradient', gradient);
	heatmap.set('radius', 25);
	heatmap.set('opacity', 1);
	heatmap.set('dissipating', true);
	heatmap.setMap(map);

}

function initMarkers() {
	
	setAllMarkers();
}

// Get Country data from Google database
function getCountries() {

	// Initialize JSONP request
	var script = document.createElement('script');
	var url = ['https://www.googleapis.com/fusiontables/v1/query?'];
	url.push('sql=');
	// Initialize a SQL query
	var query = 'SELECT name, kml_4326 FROM ' + '1foc3xO9DyfSIF6ofvN0kp2bxSfSeKog5FbdWdQ';
	var encodedQuery = encodeURIComponent(query);
	url.push(encodedQuery);
	url.push('&callback=drawCountries');
	url.push('&key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ');
	script.src = url.join('');
	var body = document.getElementsByTagName('body')[0];
	body.appendChild(script);
}

// Draw layers for Countries from the data	
function drawCountries(data) {

	var rows = data['rows'];
	// Draw each country
	for (var i in rows) {
		var countryName = rows[i][0].replace(" ","-");
		if (countryName != 'Antarctica') {
		var newCoordinates = [];
		var geometries = rows[i][1]['geometries'];
		if (geometries) {
		  for (var j in geometries) {
		    newCoordinates.push(constructNewCoordinates(geometries[j]));
		  }
		} else {
		  newCoordinates = constructNewCoordinates(rows[i][1]['geometry']);
		}
		var country = new google.maps.Polygon({
		  paths: newCoordinates,
		  strokeColor: shadeColor(mainCountryColor,0),
		  strokeOpacity: 0.8,
		  strokeWeight: 1,
		  fillColor: shadeColor(mainCountryColor,100),
		  fillOpacity: 0.6
		});
		google.maps.event.addListener(country, 'mouseover', function() {
		  this.setOptions({strokeWeight: 3});
		});
		google.maps.event.addListener(country, 'mouseout', function() {
		  this.setOptions({strokeWeight: 1});
		});

		// Normalize countries
		if(countryName == "Czech-Rep.") {
			countryName = "Czech-Republic";
		} else if (countryName == "Russia") {
			countryName = "Russian-Federation";
		} else if (countryName == "Moldova,-Republic of") {
			countryName = "Moldova";
		}

		// Save the countries with their visual data
		countryDB[countryName] = new Object();
		countryDB[countryName]['count'] = 0;
		countryDB[countryName]['polygon'] = country
		}
	}
}

//Bitwise transfer the color to be darker, in hex
function shadeColor(color, percent) {   
	var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
	return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
}

// Help function for drawing countries
function constructNewCoordinates(polygon) {
	var newCoordinates = [];
	var coordinates = polygon['coordinates'][0];
	for (var i in coordinates) {
	  newCoordinates.push(
	      new google.maps.LatLng(coordinates[i][1], coordinates[i][0]));
	}
	return newCoordinates;
}

function initCountries(map) {
	for (var countryName in countryDB) {
		var country = countryDB[countryName];
		if(country.count > 0) {
			country.polygon.setMap(map);
			country.polygon.setOptions({ fillColor: shadeColor(mainCountryColor, 100 - 5*country.count)});
		}
	}

	// Create legenda
	if(map == null) {
		$("#legenda").html('');
	} else {
		$("#legenda").append("<div id='legenda-start'>0</div>");
		for(var i=100; i>-10; i--) {
			color = shadeColor(mainCountryColor,i);
			$("#legenda").append("<div class='legenda-block' style='background-color:"+ color +"'></div>");
		}
		$("#legenda").append("<div id='legenda-end'>100</div>");
	}
}

function transactionValue(map) {
	for (var i = 0; i < globalCircles.length; i++) {
		globalCircles[i].setMap(map);
	}
}

function setAllMarkers() {
	// set all markers from the past
	for (var transaction in database) {
		m = database[transaction].marker;
		if (m != null) {
			m.setMap(map);
		}
	}
	if (mode == "grouped") {
		markerCluster = new MarkerClusterer(map, globalMarkers);
	} else {

	}
}

function resetAllMarkers() {
	for (var transaction in database) {
		m = database[transaction].marker;
		if (m != null) {
			m.setMap(null);
		}
	}
	if (markerCluster != null) {
		markerCluster.clearMarkers();
	}
}

function getData() {

	hashes = [];
	// Get IP addresses from blockchain
	socket = new WebSocket('ws://ws.blockchain.info/inv');
	socket.onopen = function() {
	   socket.send('{"op":"unconfirmed_sub"}');
	};
	socket.onmessage = function(s) {
		transaction = jQuery.parseJSON(s.data);
		hash = transaction.x.hash;
		database[hash] = new Object();
		database[hash].info = transaction.x;
		database[hash]["amount"] = 0;
		hashes.push(hash);
		ipAddressesHashes.push(hash);
	};
	checkForNewIPs();
	
	function checkForNewIPs(){
		
		if(ipAddressesHashes.length != 0 ){
			hash = ipAddressesHashes.shift();
			ipAddress = database[hash].info.relayed_by;
			callbackAddData = function(ipData) {
				database[hash].ipData = ipData;
				ipGrouped[ipAddress] = [];
				ipGrouped[ipAddress].push(hash);
				addDataToMap(hash);
				exportIp[ipAddress] = ipData;				
			};
			if( exportIp[ipAddress] == null) {
				getLocationIP(ipAddress, callbackAddData);
			} else {
				database[hash].ipData = exportIp[ipAddress];
				addDataToMap(hash);
			}
			
		}
		setTimeout(function(){checkForNewIPs()},500);
		
	}

	function getLocationIP(ipAddress, callback){
		
		if(ipAddress != "127.0.0.1"){		
			//cl("Get location from: " + ipAddress);
			$.getJSON("http://ip-api.com/json/" + ipAddress, function( ipData ) {
				callback(ipData);
			});
		}
	}

}

// General functionality for visual appearance for each transaction
function addDataToMap(hash) {

	transaction = database[hash];
	var position = new google.maps.LatLng(transaction.ipData.lat, transaction.ipData.lon);

	marker = new google.maps.Marker({
		position: position,
		title: database[hash].ipData.as,
		map: map,
		animation: google.maps.Animation.DROP,
		icon: image
	});
	marker.set("hash", hash);
	if(mode.substring(0,mode.length-1)) {
		marker.setMap(null);
	}

	google.maps.event.addListener(marker, 'click', function() {
		setInfoWindow(this)
	});
	globalMarkers.push(marker);
	transaction.marker = marker;
	heatmapData.push(position);
	countryName = database[hash].ipData.country.replace(" ", "-");
	if(countryDB[countryName] != undefined) {
		countryDB[countryName]["count"]++;
	}

	
	switch(mode)
	{
		case "heatmap":
			addToHeatMap(hash);
			break;
		case "markers":
			addMarker(hash);
			break;
		case "countries":
			addToCountry(hash);
			break;
		case "transaction-value":
			addTransactionValue(hash);
			break;
		case "transaction-value":
			addTransactionValue(hash);
			break;
		default:
			addMarker(hash);
	}
}

function addToHeatMap(hash){
		
	heatmap.setData(heatmapData);
	removeLastMarker();
	
}

function addMarker(hash) {
	if(mode == "grouped") {
		resetAllMarkers();
		setAllMarkers();
	}
}

function addToCountry(hash){

	countryName = database[hash].ipData.country.replace(" ","-");
	if(countryDB[countryName] != undefined) {
		countryCount = countryDB[countryName].count;
		countryPolygon = countryDB[countryName].polygon;
		countryPolygon.setMap(null);
		countryPolygon.setOptions({ fillColor: shadeColor(mainCountryColor, 100 - 5*countryCount)});
		countryPolygon.setMap(map);

		removeLastMarker();
	}	
}

function addTransactionValue(hash) {
	marker = database[hash].marker;
	trans = database[hash].info.inputs;
	amount = 0;
	for(i=0; i<trans.length; i++) {
		amount += trans[i]["prev_out"]["value"];
	}
	database[hash]["amount"] += amount;
	ip = database[hash]["info"]["relayed_by"];
	console.log(ip);
	totalAmount = getIpAmount(ip);

	if (totalAmount != database[hash]["amount"]) {
		deleteIpCircle(ip);
	}


	var circle = new google.maps.Circle({
		map: map,
		radius: Math.log(totalAmount)*10000,
		fillColor: '#AA0000'
	});
	circle.bindTo('center', marker, 'position');
	database[hash]["circle"] = circle;
	globalCircles.push(circle);
	//removeLastMarker();
}

function deleteIpCircle(ip) {
	if(ipGrouped[ip] != undefined) {
		for (var i = 0; i < ipGrouped[ip].length; i++) {
			hash = ipGrouped[ip][i];
			if(database[hash]["circle"] != undefined) {
				database[hash]["circle"].setMap(null);
			}
		}
	}
}

function removeLastMarker() {
	if( lastMarker != null) {
		lastMarker.setMap(null);
	}
	lastMarker = marker;
}

function setInfoWindow(marker) {

	if(currentOpenWindow != null) {
		currentOpenWindow.close();
	}

	hash = marker.get("hash");
	// Some useful data will be shown here later
	var contentString = database[hash].ipData.country + ": " + database[hash].ipData.city;
	if(mode == "transaction-value") {
		totalAmount = Math.round(getIpAmount(database[hash]["info"]["relayed_by"]) / 100000000 * currentUSDprice);
		contentString += "<br/>Total Transaction value: &#36;" + totalAmount;
	}
	var infowindow = new google.maps.InfoWindow({
		content: contentString
	});
	infowindow.open(map,marker);
	currentOpenWindow = infowindow;
}

function getCurrentPrice(){
	
	$.getJSON("https://blockchain.info/q/24hrprice", function( price ) {
		currentUSDprice = price;
	});
	
}

function getIpAmount(ip) {
	amount = 0;

	if(ipGrouped[ip] != null) {
		for (var i = 0; i < ipGrouped[ip].length; i++) {
			hash = ipGrouped[ip][i];
			amount += database[hash]["amount"];
		};
	}
	return amount;
}

function toggleDayNight() {
	if(!dayNightOn){
		dayNight.setMap(map);
		dayNightOn = true;
	}else{
		dayNight.setMap(null);
		dayNightOn = false;
	}
}

function cl(message){
	//console.log(message);
	//$("#log-info").prepend("<li>" + message + "</li>");
}
