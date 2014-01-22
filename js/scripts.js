globalMarkers = [];
relayedData = [];
var heatmap;

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
	for(i=0; i<globalMarkers.length; i++) {
		 m = globalMarkers[i];
		 m.setMap(null);
	}
	
	heatmap = new google.maps.visualization.HeatmapLayer({
		data: relayedData,	
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
	for(i=0; i<globalMarkers.length; i++) {
		 m = globalMarkers[i];
		 m.setMap(map);
	}
}

function getData() {
	ip_addresses = []; // list with IP address that need to be verified
	hashes = []; // list with transaction hashes
	/*Get IP addresses from blockchain */
	socket= new WebSocket('ws://ws.blockchain.info/inv');
	socket.onopen= function() {
	   socket.send('{"op":"unconfirmed_sub"}');
	};
	socket.onmessage= function(s) {
		transaction = jQuery.parseJSON(s.data);
		hash = transaction.x.hash;
		hashes.push(hash);
		ip_address = transaction.x.relayed_by;
		ip_addresses.push(ip_address);   
	};
	checkForNewIPs();
	checkForNewHashes();
	
	function checkForNewIPs(){
		
		if(ip_addresses.length != 0){
			ip_address = ip_addresses.shift();
			getLocationIP(ip_address);
		}
		setTimeout(function(){checkForNewIPs()},500);
		
	}

	function getLocationIP(ipAddress){
		
		if(ipAddress != "127.0.0.1"){		
			cl("Get location from: " + ipAddress);
			$.getJSON("http://ip-api.com/json/" + ipAddress, function( data ) {
				addData(data);
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

function addData(data) {

	var position = new google.maps.LatLng(data.lat, data.lon);
	marker = new google.maps.Marker({
         position: position,
         map: map
    });
	globalMarkers.push(marker);
	relayedData.push(position);
	
	switch(mode)
	{
		case "heatmap":
		  addToHeatMap(position,marker);
		  break;
		case "markers":
		  addMarker(position,marker);
		  break;
		default:
		  addToHeatMap(position,marker);
	}
}

function addToHeatMap(position, marker){
		
	heatmap.setData(relayedData);
	// delete old marker
	if(globalMarkers.length > 1) {
		globalMarkers[globalMarkers.length-2].setMap(null);
	}
	
}

function addMarker(position,marker) {
	//marker already set in initialization
}

function cl(message){

	console.log(message);
	$("#log-info").prepend("<li>" + message + "</li>");
}



