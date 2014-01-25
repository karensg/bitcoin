database = new Object();
ipAddressesHashes = [];
heatmapData = [];
var heatmap;
lastMarker = null;
image = 'images/bitcoin.png';

$(document).ready(function(e) {

	// Create useless log block
	$("#toggle-log").click(function() {
		cl("click");
		$(this).parent().toggleClass("active");
		$("#log-block").fadeToggle();
	});
	
	// Create map
	var mapOptions = {
		zoom: 3	,
		center: new google.maps.LatLng(51.37180, 13.23583)
	};
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	
	reload();
	getData();
	
});

function reload() {

	mode = window.location.hash.substring(1);
	switch(mode)
	{
		case "heatmap":
			initHeatmap();
			break;
		case "markers":
			initMarkers();
			break;
		default:
			initHeatmap();
	}
}

window.onhashchange = function() {
	reload();
};

function initHeatmap() {

	// reset all markers from other views
	for (var transaction in database) {
		m = database[transaction].marker;
		if (m != null) {
			m.setMap(null);
		}
	}
	
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

	// hide heatmap if available
	if(heatmap != undefined) {
		heatmap.setMap(null);
	}
	
	// set all markers from the past
	for (var transaction in database) {
		m = database[transaction].marker;
		if (m != null) {
			m.setMap(map);
		}
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
			
			console.log("Get transaction data: " + hash);
		});
		
	}
}

function addDataToMap(hash) {

	
	transaction = database[hash];
	var position = new google.maps.LatLng(transaction.ipData.lat, transaction.ipData.lon);
	

	marker = new google.maps.Marker({
		position: position,
		map: map,
		animation: google.maps.Animation.DROP,
		icon: image
	});

	google.maps.event.addListener(marker, 'click', function() {
		setInfoWindow(this)
	});

	transaction.marker = marker;
	heatmapData.push(position);
	
	switch(mode)
	{
		case "heatmap":
			addToHeatMap(hash);
			break;
		case "markers":
			addMarker(hash);
			break;
		default:
			addToHeatMap(hash);
	}
}

function addToHeatMap(hash){
		
	heatmap.setData(heatmapData);
	if( lastMarker != null) {
		lastMarker.setMap(null);
	}
	lastMarker = marker;
	
}

function addMarker(hash) {
	//marker already set in initialization
}

function setInfoWindow(marker) {
	var contentString = "Still Loading...";
	var infowindow = new google.maps.InfoWindow({
		content: contentString
	});
	infowindow.open(map,marker);
}

function cl(message){

	//console.log(message);
	//$("#log-info").prepend("<li>" + message + "</li>");
}