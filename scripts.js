function initialize() {
  var mapOptions = {
    zoom: 3	,
    center: new google.maps.LatLng(51.37180, 13.23583)
  };

	var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	var marker;
	var myLatlng;
	/*$.getJSON( "locations.json", function( data ) {
		$.each( data, function( key, ip ) {
			myLatlng = new google.maps.LatLng(ip.lat,ip.lon);
			 marker = new google.maps.Marker({
				position: myLatlng,
				map: map,
				title: ip.org
			});
		});
 
	});*/
}


//google.maps.event.addDomListener(window, 'load', initialize);
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
	console.log("New ip found: " + ip_address);
	ip_addresses.push(ip_address);   
};


function checkForNewIPs(){
	
	console.log("Check for new ips: "+ ip_addresses.length);
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
			//console.log(data);
			addToHeatMap(data.lat,data.lon);
	 
		});
	}
}

function addToHeatMap(lat,long){
	
	console.log("Add lat: " + lat + " and long: " + long);
	
}




