var hasline = 0;

var markers = [];
var googlemapsgeneratedplots = [];
var resultsids = [
	["resultsbtn1", "resultsbtn1li1", "resultsbtn1li2", "resultsbtn1li3", "collapseExample0"],
	["resultsbtn2", "resultsbtn2li1", "resultsbtn2li2", "resultsbtn2li3", "collapseExample1"], 
	["resultsbtn3", "resultsbtn3li1", "resultsbtn3li2", "resultsbtn3li3", "collapseExample2"]
];

var lineSymbol;

var polylineOptionsActual;
var polylineOptionsActual2;
var polylineOptionsActual3;
var polylineOptionsActual4;
var polylineOptionsActual5;

var rendererOptions;
var rendererOptions2;
var rendererOptions3;
var rendererOptions4;	
var rendererOptionswalk;

var directionsService;
var directionsService2;
var directionsService3;
var directionsService4;
var directionsService5;

var directionsDisplay;
var directionsDisplay2;
var directionsDisplay3;
var directionsDisplay4;
var walkingdirectionsDisplay;

var walkingmarker1;
var walkingmarker2;

var bus1marker1;
var bus1marker2;
var bus1marker3;
var bus1marker4;

var bus2marker1;
var bus2marker2;
var bus2marker3;
var bus2marker4;

var line1;
var line2;

var walkingrouteexists = false;
var busroute1exists = false;
var busroute2exists = false;

var order = [];
var firstresultsblockisdisplayed = false;
$(document).ready(function(){

	

	//getLocation();
	var userlat;
	var userlong;
	
	var options = {
	  enableHighAccuracy: true,
	  timeout: 5000,
	  maximumAge: 0
	};

	navigator.geolocation.getCurrentPosition(success, error, options);

	function error(err) {
	  console.warn(`ERROR(${err.code}): ${err.message}`);
	}

	function success(pos) {
	  userlat = pos.coords.latitude;
	  userlong = pos.coords.longitude;
	}
	var origloaderhtml = document.getElementById("results_body").innerHTML;
	var random;
    $("#calculate").click(function(){
    	var div = document.getElementById('results_body');
    order = [];
    firstresultsblockisdisplayed = false;
    document.getElementById("results_body").innerHTML = origloaderhtml;

    	if (walkingrouteexists)
    	{
    		walkingdirectionsDisplay.setMap(null);
    		walkingmarker1.setVisible(false);
    		walkingmarker2.setVisible(false);
    		walkingrouteexists = false;
    	}
    	if (busroute1exists)
    	{
    		directionsDisplay.setMap(null);
    		directionsDisplay2.setMap(null);
    		bus1marker1.setVisible(false);
    		bus1marker2.setVisible(false);
    		bus1marker3.setVisible(false);
    		bus1marker4.setVisible(false);
    		line1.setMap(null);
    		busroute1exists = false;
    	}
    	if (busroute2exists)
    	{
    		directionsDisplay3.setMap(null);
    		directionsDisplay4.setMap(null);
    		bus2marker1.setVisible(false);
    		bus2marker2.setVisible(false);
    		bus2marker3.setVisible(false);
    		bus2marker4.setVisible(false);
    		line2.setMap(null);
    		busroute2exists = false;
    	}
    	
    	$("#loaderelement").show();

    	var srcval;
		if (document.getElementById('myInput').value == "Use My Location")
		{
			srcval = "usercoordsused" + str(userlat) + "," +str(userlong);
		}
		else
		{
			srcval = document.getElementById('myInput').value
		}
    	$.getJSON($SCRIPT_ROOT + '/FastTrackPython', {

	        src: srcval,
	        dst: document.getElementById('myInput2').value
	      }, function(data) {

	      	console.log(data.result);

	      	lineSymbol = {
			    path: google.maps.SymbolPath.CIRCLE,
			    fillOpacity: 1,
			    scale: 3
			};

			polylineOptionsActual = new google.maps.Polyline({
			    strokeColor: 'yellow',
			    strokeOpacity: 0,
			    icons: [{
			      icon: lineSymbol,
			      offset: '0',
			      repeat: '10px'
			    }]
			});

			

			polylineOptionsActual2 = new google.maps.Polyline({
			    strokeColor: 'green',
			    strokeOpacity: 0,
			    icons: [{
			      icon: lineSymbol,
			      offset: '0',
			      repeat: '10px'
			    }]
			});

			polylineOptionsActual4 = new google.maps.Polyline({
			    strokeColor: 'yellow',
			    strokeOpacity: 0,
			    icons: [{
			      icon: lineSymbol,
			      offset: '0',
			      repeat: '10px'
			    }]
			});

			

			polylineOptionsActual5 = new google.maps.Polyline({
			    strokeColor: 'green',
			    strokeOpacity: 0,
			    icons: [{
			      icon: lineSymbol,
			      offset: '0',
			      repeat: '10px'
			    }]
			});

			rendererOptions = {
			    map: map,
			    suppressMarkers: true,
			    polylineOptions: polylineOptionsActual,
			    preserveViewport: true
			};

			rendererOptions2 = {
			    map: map,
			    suppressMarkers: true,
			    polylineOptions: polylineOptionsActual2,
			    preserveViewport: true
			};

			rendererOptions3 = {
			    map: map,
			    suppressMarkers: true,
			    polylineOptions: polylineOptionsActual4,
			    preserveViewport: true
			};

			rendererOptions4 = {
			    map: map,
			    suppressMarkers: true,
			    polylineOptions: polylineOptionsActual5,
			    preserveViewport: true
			};

			polylineOptionsActual3 = new google.maps.Polyline({
			    strokeColor: 'grey',
			    strokeOpacity: 0,
			    icons: [{
			      icon: lineSymbol,
			      offset: '0',
			      repeat: '10px'
			    }]
			});

			rendererOptionswalk = {
			    map: map,
			    suppressMarkers: true,
			    polylineOptions: polylineOptionsActual3,
			    preserveViewport: true
			};

			directionsService = new google.maps.DirectionsService;
			directionsService2 = new google.maps.DirectionsService;
			directionsService3 = new google.maps.DirectionsService;
			directionsService4 = new google.maps.DirectionsService;
			directionsService5 = new google.maps.DirectionsService;

			directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
			directionsDisplay2 = new google.maps.DirectionsRenderer(rendererOptions2);
			directionsDisplay3 = new google.maps.DirectionsRenderer(rendererOptions3);
			directionsDisplay4 = new google.maps.DirectionsRenderer(rendererOptions4);
			walkingdirectionsDisplay = new google.maps.DirectionsRenderer(rendererOptionswalk);

			var alldirectionsServices = [directionsService, directionsService2, directionsService3, directionsService4];

			var alldirectionsDisplay = [directionsDisplay, directionsDisplay2, directionsDisplay3, directionsDisplay4];

			var routeplottingindex = 0;

	      	$("#loaderelement").hide();
	      	var div = document.getElementById('results_body');
	      	var busroutecounter = 0;

	      	if (data.result[0][0].startsWith("Sorry"))
	      	{
	      		div.innerHTML += data.result[0][0];
	      		var currlist = data.result[1];
  				
  				var time = currlist[1];
  				var destcoords = currlist[2];
  				var message = "Walk from your current location to " + document.getElementById('myInput2').value;
  				document.getElementById(resultsids[0][0]).innerHTML = "Walking ("+time+" mins)";
  				document.getElementById(resultsids[0][1]).innerHTML = message;
  				document.getElementById(resultsids[0][0]).style.display = "block";
  				document.getElementById(resultsids[0][1]).style.display = "block";

  				$('#'+resultsids[0][4]).collapse('show');

				walkingdirectionsDisplay.setMap(map);

				var org = new google.maps.LatLng (userlat, userlong);
				var dst = new google.maps.LatLng (parseFloat(destcoords.split(",")[0]), parseFloat(destcoords.split(",")[1]));

				directionsService5.route({
				    origin: org,
				    destination: dst,
				    travelMode: 'WALKING'
				  }, function(response, status) {
				  	walkingdirectionsDisplay.setDirections(response);
				    if (status === 'OK') {
				      walkingdirectionsDisplay.setDirections(response);
				    } else {
				      window.alert('Directions request failed due to ' + status);
				    }
				  });

				walkingmarker1 = new google.maps.Marker({
				    position: new google.maps.LatLng(userlat, userlong),
				    label: 'Current Location',
				    title: 'Current Location',
				    map:map
				});

				walkingmarker2 = new google.maps.Marker({
				    position: new google.maps.LatLng(parseFloat(destcoords.split(",")[0]), parseFloat(destcoords.split(",")[1])),
				    label: $('input[name="dst"]').val(),
				    title: $('input[name="dst"]').val(),
				    map:map
				});
				walkingrouteexists = true;
				order.push("W");
				firstresultsblockisdisplayed = true;
	      	}
	      	else
	      	{
	      		for (var i = 0, size = data.result.length; i < size ; i++)
	      		{
	      			var currlist = data.result[i];
	      			if (currlist[0].startsWith("walking route"))
	      			{
	      				console.log("list " + i.toString() + " starts with walking	route");

	      				var time = currlist[1];
	      				var destcoords = currlist[2];
	      				var message = "Walk from your current location to " + document.getElementById('myInput2').value;
	      				document.getElementById(resultsids[i][0]).innerHTML = "Walking ("+time+" mins)";
	      				document.getElementById(resultsids[i][1]).innerHTML = message;
	      				document.getElementById(resultsids[i][0]).style.display = "block";
	      				document.getElementById(resultsids[i][1]).style.display = "block";

						walkingdirectionsDisplay.setMap(map);

						var org = new google.maps.LatLng (userlat, userlong);
						var dst = new google.maps.LatLng (parseFloat(destcoords.split(",")[0]), parseFloat(destcoords.split(",")[1]));			

						directionsService5.route({
						    origin: org,
						    destination: dst,
						    travelMode: 'WALKING'
						  }, function(response, status) {
						  	walkingdirectionsDisplay.setDirections(response);
						    if (status === 'OK') {
						      walkingdirectionsDisplay.setDirections(response);
						    } else {
						      window.alert('Directions request failed due to ' + status);
						    }
						  });

						walkingmarker1 = new google.maps.Marker({
						    position: new google.maps.LatLng(userlat, userlong),
						    label: 'Current Location',
						    title: 'Current Location',
						    map:map
						});

						walkingmarker2 = new google.maps.Marker({
						    position: new google.maps.LatLng(parseFloat(destcoords.split(",")[0]), parseFloat(destcoords.split(",")[1])),
						    label: $('input[name="dst"]').val(),
						    title: $('input[name="dst"]').val(),
						    map:map
						});

						if (!firstresultsblockisdisplayed)
						{
							$('#'+resultsids[i][4]).collapse('show');
							firstresultsblockisdisplayed = true;
						}
						else
						{
							walkingdirectionsDisplay.setMap(null);
							walkingmarker1.setVisible(false);
							walkingmarker2.setVisible(false);
						}

						walkingrouteexists = true;
						order.push("W");
						firstresultsblockisdisplayed = true;
	      			}
	      			else
	      			{
	      				busroutecounter = busroutecounter + 1;
	      				console.log("list " + i.toString() + " no walking route");

	      				var msg1 = currlist[0];
	      				var msg2 = currlist[1];
	      				var msg3 = currlist[2];
	      				var hashedpolyline = currlist[3];
	      				var srcstopcoords = currlist[4];
	      				var dststopcoords = currlist[5];
	      				var finaldststopcoords = currlist[6]; 
	      				var srcstopname =currlist[7];
	      				var dststopname =currlist[8];
	      				var total_time = currlist[9];
	      				
	      				document.getElementById(resultsids[i][1]).innerHTML = msg1;
	      				document.getElementById(resultsids[i][2]).innerHTML = msg2;
	      				document.getElementById(resultsids[i][3]).innerHTML = msg3;
	      				document.getElementById(resultsids[i][0]).style.display = "block";
	      				document.getElementById(resultsids[i][1]).style.display = "block";
	      				document.getElementById(resultsids[i][2]).style.display = "block";
	      				document.getElementById(resultsids[i][3]).style.display = "block";

						var directionsdisplaysarray = [];

						if (busroutecounter == 1)
						{
							document.getElementById(resultsids[i][0]).innerHTML = "Bus 1 Time: ("+total_time+" mins)";
		      				/*PLOTS THE BUS POLYLINE*/
		      				var decode = google.maps.geometry.encoding.decodePath(hashedpolyline);
					        line1 = new google.maps.Polyline({
						        path: decode,
						        strokeColor: '#00008B',
						        strokeOpacity: 1.0,
						        strokeWeight: 4,
						        zIndex: 3
						    });
						    line1.setMap(map);	

							directionsDisplay.setMap(map);
						  	
						  	var org = new google.maps.LatLng (userlat, userlong);
						  	var dst = new google.maps.LatLng (parseFloat(srcstopcoords.split(",")[0]), parseFloat(srcstopcoords.split(",")[1]));

						  	directionsService.route({
						    	origin: org,
						    	destination: dst,
						    	travelMode: 'WALKING'
						 	 }, function(response, status) {
						  		directionsDisplay.setDirections(response);
						  	  if (status === 'OK') {
						  	    directionsDisplay.setDirections(response);
						  	  } else {
						   	   window.alert('Directions request failed due to ' + status);
						   	 }
						   	});

						   	directionsDisplay2.setMap(map);
						   	var org2 = new google.maps.LatLng (parseFloat(dststopcoords.split(",")[0]), parseFloat(dststopcoords.split(",")[1]));
							var dst2 = new google.maps.LatLng (parseFloat(finaldststopcoords.split(",")[0]), parseFloat(finaldststopcoords.split(",")[1]));

							directionsService2.route({
							  origin: org2,
							  destination: dst2,
							  travelMode: 'WALKING'
							}, function(response, status) {
							  	directionsDisplay2.setDirections(response);
							  if (status === 'OK') {
							    directionsDisplay2.setDirections(response);
							  } else {
							    window.alert('Directions request failed due to ' + status);
							  }
							
						 	});

							bus1marker1 = new google.maps.Marker({
							    position: new google.maps.LatLng(userlat, userlong),
							    label: 'Current Location',
							    title: 'Current Location',
							    map:map
							});

							bus1marker2 = new google.maps.Marker({
							    position: new google.maps.LatLng (parseFloat(srcstopcoords.split(",")[0]), parseFloat(srcstopcoords.split(",")[1])),
							    label: srcstopname,
							    title: srcstopname,
							    map:map
							});


							bus1marker3 = new google.maps.Marker({
							  position: new google.maps.LatLng (parseFloat(dststopcoords.split(",")[0]), parseFloat(dststopcoords.split(",")[1])),
							  label: dststopname,
							  title: dststopname,
							  map:map
							});		

							bus1marker4 = new google.maps.Marker({
							  position: new google.maps.LatLng (parseFloat(finaldststopcoords.split(",")[0]), parseFloat(finaldststopcoords.split(",")[1])),
							  label: document.getElementById('myInput2').value,
							  title: document.getElementById('myInput2').value,
							  map:map
							});

							busroute1exists = true;

						 	directionsdisplaysarray.push(directionsDisplay);
						 	directionsdisplaysarray.push(directionsDisplay2);
						 	order.push("B");

							if (!firstresultsblockisdisplayed)
							{
								$('#'+resultsids[i][4]).collapse('show');
								firstresultsblockisdisplayed = true;
							}
							else
							{
								line1.setMap(null);
								directionsDisplay.setMap(null);
								directionsDisplay2.setMap(null);
								bus1marker1.setVisible(false);
								bus1marker2.setVisible(false);
								bus1marker3.setVisible(false);
								bus1marker4.setVisible(false);
							}

						}
						else if (busroutecounter == 2)
						{
							document.getElementById(resultsids[i][0]).innerHTML = "Bus 2 Time: ("+total_time+" mins)";

							/*PLOTS THE BUS POLYLINE*/
		      				var decode = google.maps.geometry.encoding.decodePath(hashedpolyline);
					        line2 = new google.maps.Polyline({
						        path: decode,
						        strokeColor: '#00008B',
						        strokeOpacity: 1.0,
						        strokeWeight: 4,
						        zIndex: 3
						    });
						    line2.setMap(map);

							directionsDisplay3.setMap(map);
						  	
						  	var org = new google.maps.LatLng (userlat, userlong);
						  	var dst = new google.maps.LatLng (parseFloat(srcstopcoords.split(",")[0]), parseFloat(srcstopcoords.split(",")[1]));

						  	directionsService3.route({
						    	origin: org,
						    	destination: dst,
						    	travelMode: 'WALKING'
						 	 }, function(response, status) {
						  		directionsDisplay3.setDirections(response);
						  	  if (status === 'OK') {
						  	    directionsDisplay3.setDirections(response);
						  	  } else {
						   	   window.alert('Directions request failed due to ' + status);
						   	 }
						   	});

						   	directionsDisplay4.setMap(map);
						   	var org2 = new google.maps.LatLng (parseFloat(dststopcoords.split(",")[0]), parseFloat(dststopcoords.split(",")[1]));
							var dst2 = new google.maps.LatLng (parseFloat(finaldststopcoords.split(",")[0]), parseFloat(finaldststopcoords.split(",")[1]));

							directionsService4.route({
							  origin: org2,
							  destination: dst2,
							  travelMode: 'WALKING'
							}, function(response, status) {
							  	directionsDisplay4.setDirections(response);
							  if (status === 'OK') {
							    directionsDisplay4.setDirections(response);
							  } else {
							    window.alert('Directions request failed due to ' + status);
							  }
							
						 	});

						 	bus2marker1 = new google.maps.Marker({
							    position: new google.maps.LatLng(userlat, userlong),
							    label: 'Current Location',
							    title: 'Current Location',
							    map:map
							});

							bus2marker2 = new google.maps.Marker({
							    position: new google.maps.LatLng (parseFloat(srcstopcoords.split(",")[0]), parseFloat(srcstopcoords.split(",")[1])),
							    label: srcstopname,
							    title: srcstopname,
							    map:map
							});


							bus2marker3 = new google.maps.Marker({
							  position: new google.maps.LatLng (parseFloat(dststopcoords.split(",")[0]), parseFloat(dststopcoords.split(",")[1])),
							  label: dststopname,
							  title: dststopname,
							  map:map
							});		

							bus2marker4 = new google.maps.Marker({
							  position: new google.maps.LatLng (parseFloat(finaldststopcoords.split(",")[0]), parseFloat(finaldststopcoords.split(",")[1])),
							  label: document.getElementById('myInput2').value,
							  title: document.getElementById('myInput2').value,
							  map:map
							});

							busroute2exists = true;

						 	directionsdisplaysarray.push(directionsDisplay3);
						 	directionsdisplaysarray.push(directionsDisplay4);
						 	order.push("B2");

						 	if (!firstresultsblockisdisplayed)
							{
								$('#'+resultsids[i][4]).collapse('show');
								firstresultsblockisdisplayed = true;
							}
							else
							{
								line2.setMap(null);
								directionsDisplay3.setMap(null);
								directionsDisplay4.setMap(null);
								bus2marker1.setVisible(false);
								bus2marker2.setVisible(false);
								bus2marker3.setVisible(false);
								bus2marker4.setVisible(false);
							}
						}
	      			}
	      		}
	      	}
	      });
	      return false;
    });
});	
