function initialize() {
  var mapOptions = {
    zoom: 3	,
    center: new google.maps.LatLng(51.37180, 13.23583)
  };

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	heatmapData = [];
	heatmap = new google.maps.visualization.HeatmapLayer({
		data: heatmapData
	});
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



