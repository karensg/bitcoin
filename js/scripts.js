function initialize() {
  var mapOptions = {
    zoom: 3	,
    center: new google.maps.LatLng(51.37180, 13.23583)
  };

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
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
	heatmap.set('radius', 20);
	heatmap.set('dissipating', true);
	heatmap.setMap(map);
	

}


google.maps.event.addDomListener(window, 'load', initialize);


ip_addresses = []; // list with ipaddress that need to be verified
checkForNewIPs();

/*Get Ip adresses from blockchain */
socket= new WebSocket('ws://ws.blockchain.info/inv');
socket.onopen= function() {
   socket.send('{"op":"unconfirmed_sub"}');
};
socket.onmessage= function(s) {
	transaction = jQuery.parseJSON(s.data);
	ip_address = transaction.x.relayed_by;
	ip_addresses.push(ip_address);   
};


function checkForNewIPs(){
	
	if(ip_addresses.length != 0){
		ip_address = ip_addresses.shift();
		getLocationIP(ip_address);
	}
	setTimeout(function(){checkForNewIPs()},500);
		
}

function getLocationIP(ipAddress){
	
	if(ipAddress != "127.0.0.1"){		
		console.log("Get location from: " + ipAddress);
		$.getJSON("http://ip-api.com/json/"+ipAddress, function( data ) {
			addToHeatMap(data.lat,data.lon);	 
		});
	}
}

function addToHeatMap(lat,lng){
	
	
	heatmapData.push(new google.maps.LatLng(lat, lng));
	heatmap.setData(heatmapData);
	
}



