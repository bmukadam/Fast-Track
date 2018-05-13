/*********************************************************************************************
 * This function creates an initial google map and creates legend to identify routes by color
 * and symbol for user. Map panning is limited to the princeton area, and zooming levels as well
 *********************************************************************************************/

var map;

function initMap() {
	//initializes map
	var uluru = {lat: 40.346481, lng: -74.658138};
    	map = new google.maps.Map(document.getElementById('map'), {
    	zoom: 16.2,
      	center: uluru,
		mapTypeControl: false
    });

    /*limits zoom and panning*/
    var opt = { minZoom: 15, maxZoom: 19};
	map.setOptions(opt);
	
	var allowedBounds = new google.maps.LatLngBounds(
	     new google.maps.LatLng(40.3149695,-74.6752898), 
	     new google.maps.LatLng(40.3805075,-74.6361918)
	);
	var lastValidCenter = map.getCenter();
	// map.fitBounds(allowedBounds);

	google.maps.event.addListener(map, 'center_changed', function() {
	    if (allowedBounds.contains(map.getCenter())) {
	        // still within valid bounds, so save the last valid position
	        lastValidCenter = map.getCenter();
	        return; 
	    }

	    // not valid anymore => return to last valid position
	    map.panTo(lastValidCenter);
	});

	//setups up icons for legend
	var icons = {
		Route1: {
			name: 'Walk Only Route',
			icon: 'https://raw.githubusercontent.com/bmukadam/Fast-Track/master/PNG%20for%20Legend/GreyDotted.PNG'
		},
		Route2: {
			name: 'Walk Route to Pickup',
			icon: 'https://raw.githubusercontent.com/bmukadam/Fast-Track/master/PNG%20for%20Legend/YellowDotted.PNG'
		},
		Route3: {
			name: 'Bus Route',
			icon: 'https://raw.githubusercontent.com/bmukadam/Fast-Track/master/PNG%20for%20Legend/BlueSolid.PNG'
		},
		Route4: {
			name: 'Walk Route from Dropoff',
			icon: 'https://raw.githubusercontent.com/bmukadam/Fast-Track/master/PNG%20for%20Legend/GreenDotted.PNG'
		}
		
	};
	
	//superimposes legend onto map element
	var legend = document.getElementById('legend');
	for (var key in icons) {
		var type = icons[key];
		var name = type.name;
		var icon = type.icon;
		var div = document.createElement('div');
		div.innerHTML = '<img src="' + icon + '"> ' + name;
		legend.appendChild(div);
	}
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(legend);
}
