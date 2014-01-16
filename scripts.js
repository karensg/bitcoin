function initialize() {
  var mapOptions = {
    zoom: 3	,
    center: new google.maps.LatLng(51.37180, 13.23583)
  };

	var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	var marker;
	var myLatlng;
	$.getJSON( "locations.json", function( data ) {
		$.each( data, function( key, ip ) {
			myLatlng = new google.maps.LatLng(ip.lat,ip.lon);
			 marker = new google.maps.Marker({
				position: myLatlng,
				map: map,
				title: ip.org
			});
		});
 
	});
}

google.maps.event.addDomListener(window, 'load', initialize);
