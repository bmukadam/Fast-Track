function resultsbtnfunction(buttonnum)
{
	console.log("entered resultsbtnfunction from button with id: " + buttonnum);
	var elemname = "#collapseExample"+buttonnum;
	if ($(elemname).hasClass('in'))
	{
		console.log(buttonnum + " thing was previously collapsed");
		if (order[buttonnum] == 'W')
		{
			//hide walking stuff
			walkingdirectionsDisplay.setMap(null);
    		walkingmarker1.setVisible(false);
    		walkingmarker2.setVisible(false);
		}
		else if (order[buttonnum] == 'B')
		{
			//hide first bus stuff
			directionsDisplay.setMap(null);
    		directionsDisplay2.setMap(null);
    		bus1marker1.setVisible(false);
    		bus1marker2.setVisible(false);
    		bus1marker3.setVisible(false);
    		bus1marker4.setVisible(false);
    		line1.setMap(null);
		}
		else if (order[buttonnum] == 'B2')
		{
			//hide sec bus stuff
			directionsDisplay3.setMap(null);
    		directionsDisplay4.setMap(null);
    		bus2marker1.setVisible(false);
    		bus2marker2.setVisible(false);
    		bus2marker3.setVisible(false);
    		bus2marker4.setVisible(false);
    		line2.setMap(null);
		}
	}
	else
	{
		console.log(buttonnum + " thing was previously open");
		if (order[buttonnum] == 'W')
		{
			//open walking stuff
			walkingdirectionsDisplay.setMap(map);
    		walkingmarker1.setVisible(true);
    		walkingmarker2.setVisible(true);
		}
		else if (order[buttonnum] == 'B')
		{
			//open first bus stuff
			directionsDisplay.setMap(map);
    		directionsDisplay2.setMap(map);
    		bus1marker1.setVisible(true);
    		bus1marker2.setVisible(true);
    		bus1marker3.setVisible(true);
    		bus1marker4.setVisible(true);
    		line1.setMap(map);

		}
		else if (order[buttonnum] == 'B2')
		{
			//open sec bus stuff
			directionsDisplay3.setMap(map);
    		directionsDisplay4.setMap(map);
    		bus2marker1.setVisible(true);
    		bus2marker2.setVisible(true);
    		bus2marker3.setVisible(true);
    		bus2marker4.setVisible(true);
	    	line2.setMap(map);
		}
	}
}