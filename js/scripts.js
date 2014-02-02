database = new Object();
ipAddressesHashes = [];
heatmapData = [];

var heatmap;
markerCluster = null;
image = 'images/bitcoin.png';
mainCountryColor = "FF3943";
dayNight = new DayNightOverlay();
dayNightOn = false;

lastMarker = null;
currentOpenWindow = null;
globalMarkers = [];

countryDB = new Object();


$(document).ready(function(e) {

	// Create useless log block
	$("#toggle-log").click(function() {
		cl("click");
		$(this).parent().toggleClass("active");
		$("#log-block").fadeToggle();
	});
	// Create useless log block
	$("#toggle-day-night").click(function() {
		cl("Toggle day-night");
		$(this).parent().toggleClass("active");
		toggleDayNight();
		return false;
	});
	
	
	// Create map
	var mapOptions = {
		zoom: 3	,
		center: new google.maps.LatLng(51.37180, 13.23583)
	};
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	getCountries();	
	reload();
	getData();
	
});

function reload() {

	mode = window.location.hash.substring(1);
	resetAllMarkers();
	// hide heatmap if available
	if(heatmap != undefined) {
		heatmap.setMap(null);
	}
	initCountries(null);



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
		default:
			initMarkers();
	}
}

window.onhashchange = function() {
	reload();
};

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

function getCountries() {

	// Initialize JSONP request
	var script = document.createElement('script');
	var url = ['https://www.googleapis.com/fusiontables/v1/query?'];
	url.push('sql=');
	var query = 'SELECT name, kml_4326 FROM ' + '1foc3xO9DyfSIF6ofvN0kp2bxSfSeKog5FbdWdQ';
	var encodedQuery = encodeURIComponent(query);
	url.push(encodedQuery);
	url.push('&callback=drawMap');
	url.push('&key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ');
	script.src = url.join('');
	var body = document.getElementsByTagName('body')[0];
	body.appendChild(script);
}
	
function drawMap(data) {

	var rows = data['rows'];
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

		//country.setMap(map);

		if(countryName == "Czech-Rep.") {
			countryName = "Czech-Republic";
		} else if (countryName == "Russia") {
			countryName = "Russian-Federation";
		} else if (countryName == "Moldova,-Republic of") {
			countryName = "Moldova";
		}

		countryDB[countryName] = new Object();
		countryDB[countryName]['count'] = 0;
		countryDB[countryName]['polygon'] = country
		}
	}

	
}

function shadeColor(color, percent) {   
	var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
	return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
}

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

	hashes = []; // list with transaction hashes
	/*Get IP addresses from blockchain */
	socket= new WebSocket('ws://ws.blockchain.info/inv');
	socket.onopen= function() {
	   socket.send('{"op":"unconfirmed_sub"}');
	};
	socket.onmessage= function(s) {
		transaction = jQuery.parseJSON(s.data);
		hash = transaction.x.hash;
		database[hash] = new Object();
		database[hash].info = transaction.x;
		hashes.push(hash);
		ipAddressesHashes.push(hash);
	};
	checkForNewIPs();
	//checkForNewHashes();
	
	function checkForNewIPs(){
		
		if(ipAddressesHashes.length != 0){
			ipAddressesHash = ipAddressesHashes.shift();
			ipAddress = database[ipAddressesHash].info.relayed_by;
			callbackAddData = function(ipData) {
				database[ipAddressesHash].ipData = ipData;
				addDataToMap(ipAddressesHash);
			};
			getLocationIP(ipAddress, callbackAddData);
			
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
	
	function checkForNewHashes(){
		
		if(hashes.length != 0){
			hash = hashes.shift();
			getTransActionData(hash);
		}
		setTimeout(function(){checkForNewHashes()},500);
		
	}

	function getTransActionData(hash){
					
		$.getJSON("https://blockchain.info/inv/" + hash + "?format=json", function( data ) {
			
			addTransactionData(data);
			console.log("Get transaction data: " + hash);
		});
		
	}
}


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
	var contentString = database[hash].ipData.country + ": " + database[hash].ipData.city
	var infowindow = new google.maps.InfoWindow({
		content: contentString
	});
	infowindow.open(map,marker);
	currentOpenWindow = infowindow;
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
