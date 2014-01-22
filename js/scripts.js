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
	
	// Define visualization mode
	mode = GetURLParameter('mode');
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
	
	
	getData();
	
});

function initHeatmap() {

	heatmapData = [];
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

	lastMarker = null;
}

function initMarkers() {
	
}

function getData() {
	ip_addresses = []; // list with IP address that need to be verified

	/*Get IP addresses from blockchain */
	socket= new WebSocket('ws://ws.blockchain.info/inv');
	socket.onopen= function() {
	   socket.send('{"op":"unconfirmed_sub"}');
	};
	socket.onmessage= function(s) {
		transaction = jQuery.parseJSON(s.data);
		ip_address = transaction.x.relayed_by;
		ip_addresses.push(ip_address);   
	};
	checkForNewIPs();
	
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
}

function addData(data) {
	switch(mode)
	{
		case "heatmap":
		  addToHeatMap(data.lat, data.lon);
		  break;
		case 2:
		  markers();
		  break;
		default:
		  addToHeatMap(data.lat, data.lon);
	}
}

function addToHeatMap(lat,lng){
	
	var position = new google.maps.LatLng(lat, lng);
	heatmapData.push(position);
	heatmap.setData(heatmapData);
	marker = new google.maps.Marker({
         position: position,
         map: map
    });
	if(lastMarker != null) {
		lastMarker.setMap(null);
	}
	lastMarker = marker;
	
}

function cl(message){

	console.log(message);
	$("#log-info").prepend("<li>" + message + "</li>");
}

