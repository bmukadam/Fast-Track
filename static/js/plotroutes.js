/***************************************************************************
 * This code takes care of sending the user's query to the backend, 
 * retrieving the results and generating the plotted routes as well 
 * as generating the results clickable buttons to enable user interactivity
 ***************************************************************************/

var hasline = 0;

var markers = [];
var googlemapsgeneratedplots = [];

//aggregates the id's of the results btn objects in order for easy traversal
var resultsids = [
	["resultsbtn1", "resultsbtn1li1", "resultsbtn1li2", "resultsbtn1li3", "collapseExample0"],
	["resultsbtn2", "resultsbtn2li1", "resultsbtn2li2", "resultsbtn2li3", "collapseExample1"], 
	["resultsbtn3", "resultsbtn3li1", "resultsbtn3li2", "resultsbtn3li3", "collapseExample2"]
];

var lineSymbol;

//declaring 5 polylineoptions vars for the 5 possible plottable polylines
var polylineOptions1;
var polylineOptions2;
var polylineOptions3;
var polylineOptions4;
var polylineOptions5;

//declaring 5 rendererOptions vars for the 5 possible plottable polylines
var rendererOptions;
var rendererOptions2;
var rendererOptions3;
var rendererOptions4;	
var rendererOptionswalk;

//declaring 5 directionsService vars for the 5 possible plottable polylines
var directionsService;
var directionsService2;
var directionsService3;
var directionsService4;
var directionsService5;

//declaring 5 directionsDisplay vars for the 5 possible plottable polylines
var directionsDisplay;
var directionsDisplay2;
var directionsDisplay3;
var directionsDisplay4;
var walkingdirectionsDisplay;

//declaring 2 walkingmarker vars for the 1 possible walking-route 
var walkingmarker1;
var walkingmarker2;

//declaring 4 busmarker vars for the 1st possible bus-route
var bus1marker1;
var bus1marker2;
var bus1marker3;
var bus1marker4;

//declaring 4 busmarker vars for the 2nd possible bus-route
var bus2marker1;
var bus2marker2;
var bus2marker3;
var bus2marker4;

//declaring 2 vars for the two possible bus-route polylines returned from the backend
var line1;
var line2;

var walkingrouteexists = false;
var busroute1exists = false;
var busroute2exists = false;

//stores order in which results are returned from the backend
//i.e just walking (1st) then bus-route (2nd)
var order = [];
var firstresultsblockisdisplayed = false;
$(document).ready(function(){

	//get user's location with their consent
	var userlat;
	var userlong;
	
	var options = {
	  enableHighAccuracy: true,
	  timeout: 5000,
	  maximumAge: 0
	};

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else { 
        alert("Geolocation is not supported by this browser.");
    }

	function showPosition(position) {
	    userlat = position.coords.latitude;
	  	userlong = position.coords.longitude;
	}

	//stores the original html present in the results field to reinitialize
	//the results field every time the submit button is clicked
	var origloaderhtml = document.getElementById("results_body").innerHTML;
    $("#calculate").click(function(){
    	var div = document.getElementById('results_body');
    order = [];
    firstresultsblockisdisplayed = false;
    // clears/reinitializes the results field
    document.getElementById("results_body").innerHTML = origloaderhtml;

    	//clears an existing walking route plot along with its markers
    	if (walkingrouteexists)
    	{
    		walkingdirectionsDisplay.setMap(null);
    		walkingmarker1.setVisible(false);
    		walkingmarker2.setVisible(false);
    		walkingrouteexists = false;
    	}
    	//clears an existing bus route plot along with its markers
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
    	//clears 2nd existing bus route plot along with its markers
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
    	
    	//starts the loader element 
    	$("#loaderelement").show();

    	//sets srcval appropriately depending on whether user specified their location or otherwise
    	var srcval;
    	console.log("something")
    	console.log("Value is: " + document.getElementById('myInput').value);
   		console.log("Value length is: " + String(document.getElementById('myInput').value).length); 	
		if (String(document.getElementById('myInput').value).length == 0)
		{
			console.log("in using your location");
			console.log("userlocation: "  + String(userlat) + "," + String(userlong));
			srcval = "usercoordsused" + String(userlat) + "," + String(userlong);
		}
		else
		{
			srcval = document.getElementById('myInput').value
		}
		//srcval = document.getElementById('myInput').value
		//sends src and dest values to the backend code 
    	$.getJSON($SCRIPT_ROOT + '/FastTrackPython', {

	        src: srcval,
	        dst: document.getElementById('myInput2').value
	      }, function(data) {

	      	//specifes symbol used to construct walking routes
	      	lineSymbol = {
			    path: google.maps.SymbolPath.CIRCLE,
			    fillOpacity: 1,
			    scale: 3
			};

			//specifies polyline drawing options between user location and pickup bus stop for 1st bus route
			polylineOptions1 = new google.maps.Polyline({
			    strokeColor: 'yellow',
			    strokeOpacity: 0,
			    icons: [{
			      icon: lineSymbol,
			      offset: '0',
			      repeat: '10px'
			    }]
			});

			//specifies polyline drawing options between dropoff bus stop and user's ultimate destination for 1st bus route
			polylineOptions2 = new google.maps.Polyline({
			    strokeColor: 'green',
			    strokeOpacity: 0,
			    icons: [{
			      icon: lineSymbol,
			      offset: '0',
			      repeat: '10px'
			    }]
			});

			//specifies polyline drawing options between user location and pickup bus stop for 2nd bus route
			polylineOptions4 = new google.maps.Polyline({
			    strokeColor: 'yellow',
			    strokeOpacity: 0,
			    icons: [{
			      icon: lineSymbol,
			      offset: '0',
			      repeat: '10px'
			    }]
			});

			//specifies polyline drawing options between dropoff bus stop and user's ultimate destination for 2nd bus route
			polylineOptions5 = new google.maps.Polyline({
			    strokeColor: 'green',
			    strokeOpacity: 0,
			    icons: [{
			      icon: lineSymbol,
			      offset: '0',
			      repeat: '10px'
			    }]
			});

			//specifies renderoptions for 1st bus route's 1st walking polyline
			rendererOptions = {
			    map: map,
			    suppressMarkers: true,
			    polylineOptions: polylineOptions1,
			    preserveViewport: true
			};

			//specifies renderoptions for 1st bus route's 2nd walking polyline
			rendererOptions2 = {
			    map: map,
			    suppressMarkers: true,
			    polylineOptions: polylineOptions2,
			    preserveViewport: true
			};

			//specifies renderoptions for 2nd bus route's 1st walking polyline
			rendererOptions3 = {
			    map: map,
			    suppressMarkers: true,
			    polylineOptions: polylineOptions4,
			    preserveViewport: true
			};

			//specifies renderoptions for 2nd bus route's 2nd walking polyline
			rendererOptions4 = {
			    map: map,
			    suppressMarkers: true,
			    polylineOptions: polylineOptions5,
			    preserveViewport: true
			};

			//specifies polyline drawing options for direct walking route
			polylineOptions3 = new google.maps.Polyline({
			    strokeColor: 'grey',
			    strokeOpacity: 0,
			    icons: [{
			      icon: lineSymbol,
			      offset: '0',
			      repeat: '10px'
			    }]
			});

			//specifies renderoptions for direct walking route
			rendererOptionswalk = {
			    map: map,
			    suppressMarkers: true,
			    polylineOptions: polylineOptions3,
			    preserveViewport: true
			};

			//instantiates the 5 googlemaps direction services
			directionsService = new google.maps.DirectionsService;
			directionsService2 = new google.maps.DirectionsService;
			directionsService3 = new google.maps.DirectionsService;
			directionsService4 = new google.maps.DirectionsService;
			directionsService5 = new google.maps.DirectionsService;

			//instatiates the 5 googlemaps DirectionsRenderers
			directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
			directionsDisplay2 = new google.maps.DirectionsRenderer(rendererOptions2);
			directionsDisplay3 = new google.maps.DirectionsRenderer(rendererOptions3);
			directionsDisplay4 = new google.maps.DirectionsRenderer(rendererOptions4);
			walkingdirectionsDisplay = new google.maps.DirectionsRenderer(rendererOptionswalk);

			//stops the loader element 
	      	$("#loaderelement").hide();
	      	var div = document.getElementById('results_body');
	      	var busroutecounter = 0;    // var used to keep track of which bus route (out of the two possible bus routes) is being proccessed/plotted

	      	//case where no bus route was found
	      	if (data.result[0][0].startsWith("Sorry"))
	      	{
	      		div.innerHTML += data.result[0][0];
	      		var currlist = data.result[1];
  				
  				//retriving time, destcoords, and user-message generated by the backend and placing it within the results field
  				var time = currlist[1];
  				var destcoords = currlist[2];
  				var message = "Walk from your current location to " + document.getElementById('myInput2').value;
  				document.getElementById(resultsids[0][0]).innerHTML = "Walking ("+time+" mins)";
  				document.getElementById(resultsids[0][1]).innerHTML = message;
  				document.getElementById(resultsids[0][0]).style.display = "block";
  				document.getElementById(resultsids[0][1]).style.display = "block";

  				$('#'+resultsids[0][4]).collapse('show');

				walkingdirectionsDisplay.setMap(map);   //attaches the walking direction object to the map var

				var org = new google.maps.LatLng (userlat, userlong);   //places user's lat and long within the org var
				var dst = new google.maps.LatLng (parseFloat(destcoords.split(",")[0]), parseFloat(destcoords.split(",")[1])); //places user's  destination lat and long within the dst var

				//uses google maps to get walking route between org and dst
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

				//creates marker to show where user is currently located
				walkingmarker1 = new google.maps.Marker({
				    position: new google.maps.LatLng(userlat, userlong),
				    label: 'Current Location',
				    title: 'Current Location',
				    map:map
				});

				//creates marker to show where user's destination is located
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
	      	else //handles case when bus routes are available
	      	{
	      		//iterates over data returned by backend
	      		for (var i = 0, size = data.result.length; i < size ; i++)
	      		{
	      			var currlist = data.result[i];

	      			//handles a walking route
	      			if (currlist[0].startsWith("walking route"))
	      			{
	      				//console.log("list " + i.toString() + " starts with walking	route");

	      				//retriving time, destcoords, and user-message generated by the backend and placing it within the results field
	      				var time = currlist[1];
	      				var destcoords = currlist[2];
	      				var message = "Walk from your current location to " + document.getElementById('myInput2').value;
	      				document.getElementById(resultsids[i][0]).innerHTML = "Walking ("+time+" mins)";
	      				document.getElementById(resultsids[i][1]).innerHTML = message;
	      				document.getElementById(resultsids[i][0]).style.display = "block";
	      				document.getElementById(resultsids[i][1]).style.display = "block";

						walkingdirectionsDisplay.setMap(map);  //attaches the walking direction object to the map var

						var org = new google.maps.LatLng (userlat, userlong);
						var dst = new google.maps.LatLng (parseFloat(destcoords.split(",")[0]), parseFloat(destcoords.split(",")[1]));			

						//uses google maps to get walking route between org and dst
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

						//creates marker to show where user is currently located
						walkingmarker1 = new google.maps.Marker({
						    position: new google.maps.LatLng(userlat, userlong),
						    label: 'Current Location',
						    title: 'Current Location',
						    map:map
						});

						//creates marker to show where user's destination is located
						walkingmarker2 = new google.maps.Marker({
						    position: new google.maps.LatLng(parseFloat(destcoords.split(",")[0]), parseFloat(destcoords.split(",")[1])),
						    label: $('input[name="dst"]').val(),
						    title: $('input[name="dst"]').val(),
						    map:map
						});

						//checks if walking route is optimal route, if so it's result-block will be expanded and will be plotted
						if (!firstresultsblockisdisplayed)
						{
							$('#'+resultsids[i][4]).collapse('show');
							firstresultsblockisdisplayed = true;
						}
						else  //if walking route isn't optimal route, it will be made non-visible
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
	      				//console.log("list " + i.toString() + " no walking route");

	      				//retrieves the 3-step instructional messages
	      				var msg1 = currlist[0];
	      				var msg2 = currlist[1];
	      				var msg3 = currlist[2];

	      				var hashedpolyline = currlist[3];      //retrieves the aggregated bus-route hashed polyline
	      				var srcstopcoords = currlist[4];       //retrieves the pick-up bus stop coords
	      				var dststopcoords = currlist[5];	   //retrieves the drop-off bus stop coords
	      				var finaldststopcoords = currlist[6];  //retrieves user's destination coords
	      				var srcstopname =currlist[7];          //retrieves name of the pick-up bus stop coords
	      				var dststopname =currlist[8];		   //retrieves name of the drop-off bus stop coords
	      				var total_time = currlist[9];	       //retrieves total trip time

	      				//populates above retrieved data into appropriate fields	      				
	      				document.getElementById(resultsids[i][1]).innerHTML = msg1;
	      				document.getElementById(resultsids[i][2]).innerHTML = msg2;
	      				document.getElementById(resultsids[i][3]).innerHTML = msg3;
	      				document.getElementById(resultsids[i][0]).style.display = "block";
	      				document.getElementById(resultsids[i][1]).style.display = "block";
	      				document.getElementById(resultsids[i][2]).style.display = "block";
	      				document.getElementById(resultsids[i][3]).style.display = "block";

	      				//is this is first bus-route we encounter?
						if (busroutecounter == 1)
						{
							document.getElementById(resultsids[i][0]).innerHTML = "Bus 1 Time: ("+total_time+" mins)";

		      				/*PLOTS THE BUS ROUTE POLYLINE*/
		      				var decode = google.maps.geometry.encoding.decodePath(hashedpolyline);
					        line1 = new google.maps.Polyline({
						        path: decode,
						        strokeColor: '#00008B',
						        strokeOpacity: 1.0,
						        strokeWeight: 4,
						        zIndex: 3
						    });
						    line1.setMap(map);	

						    /*PLOTS THE WALKING ROUTE FROM USER'S CURRENT LOCATION TO THE PICKUP BUS STOP*/
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

						  	/*PLOTS THE WALKING ROUTE FROM USER'S DROPOFF BUS STOP TO USER'S ULTIMATE DESTINATION*/
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

							/*PLOTS MARKER FOR USER'S CURRENT LOCATION TO THE PICKUP BUS STOP*/
							bus1marker1 = new google.maps.Marker({
							    position: new google.maps.LatLng(userlat, userlong),
							    label: 'Current Location',
							    title: 'Current Location',
							    map:map
							});

							/*PLOTS MARKER FOR USER'S PICKUP BUS STOP*/
							bus1marker2 = new google.maps.Marker({
							    position: new google.maps.LatLng (parseFloat(srcstopcoords.split(",")[0]), parseFloat(srcstopcoords.split(",")[1])),
							    label: srcstopname,
							    title: srcstopname,
							    map:map
							});

							/*PLOTS MARKER FOR USER'S DROPOFF BUS STOP*/
							bus1marker3 = new google.maps.Marker({
							  position: new google.maps.LatLng (parseFloat(dststopcoords.split(",")[0]), parseFloat(dststopcoords.split(",")[1])),
							  label: dststopname,
							  title: dststopname,
							  map:map
							});		

							/*PLOTS MARKER FOR USER'S ULTIMATE DESTINATION*/
							bus1marker4 = new google.maps.Marker({
							  position: new google.maps.LatLng (parseFloat(finaldststopcoords.split(",")[0]), parseFloat(finaldststopcoords.split(",")[1])),
							  label: document.getElementById('myInput2').value,
							  title: document.getElementById('myInput2').value,
							  map:map
							});

							busroute1exists = true;

						 	order.push("B");

						 	//checks if 1st bus route is optimal route, if so it's result-block will be expanded and will be plotted
							if (!firstresultsblockisdisplayed)
							{
								$('#'+resultsids[i][4]).collapse('show');
								firstresultsblockisdisplayed = true;
							}
							else //if 1st bus route isn't optimal route, it will be made non-visible
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
						else if (busroutecounter == 2)  //is this is the 2nd bus-route we encounter?
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

						    /*PLOTS THE WALKING ROUTE FROM USER'S CURRENT LOCATION TO THE PICKUP BUS STOP*/
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

						  	/*PLOTS THE WALKING ROUTE FROM USER'S DROPOFF BUS STOP TO USER'S ULTIMATE DESTINATION*/
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

							//creates marker to show where user is currently located
						 	bus2marker1 = new google.maps.Marker({
							    position: new google.maps.LatLng(userlat, userlong),
							    label: 'Current Location',
							    title: 'Current Location',
							    map:map
							});

						 	/*PLOTS MARKER FOR USER'S PICKUP BUS STOP*/
							bus2marker2 = new google.maps.Marker({
							    position: new google.maps.LatLng (parseFloat(srcstopcoords.split(",")[0]), parseFloat(srcstopcoords.split(",")[1])),
							    label: srcstopname,
							    title: srcstopname,
							    map:map
							});

							/*PLOTS MARKER FOR USER'S DROPOFF BUS STOP*/
							bus2marker3 = new google.maps.Marker({
							  position: new google.maps.LatLng (parseFloat(dststopcoords.split(",")[0]), parseFloat(dststopcoords.split(",")[1])),
							  label: dststopname,
							  title: dststopname,
							  map:map
							});		

							/*PLOTS MARKER FOR USER'S ULTIMATE DESTINATION*/
							bus2marker4 = new google.maps.Marker({
							  position: new google.maps.LatLng (parseFloat(finaldststopcoords.split(",")[0]), parseFloat(finaldststopcoords.split(",")[1])),
							  label: document.getElementById('myInput2').value,
							  title: document.getElementById('myInput2').value,
							  map:map
							});

							busroute2exists = true;

						 	order.push("B2");

						 	//checks if 2nd bus route is optimal route, if so it's result-block will be expanded and will be plotted
						 	if (!firstresultsblockisdisplayed)
							{
								$('#'+resultsids[i][4]).collapse('show');
								firstresultsblockisdisplayed = true;
							}
							else //if 2nd bus route isn't optimal route, it will be made non-visible
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
