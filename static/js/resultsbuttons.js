/***************************************************************************
 * This code enable user interactivity with all the route result fields.
 * If a route result is clicked when its closed, it will expand to show
 * details and will generate its corresponding route plot. Otherwise, if it
 * was open, it will contract, and its corresponding route plot will disappear.
 ***************************************************************************/

function resultsbtnfunction(buttonnum)
{
	console.log("entered resultsbtnfunction from button with id: " + buttonnum);
	var elemname = "#collapseExample"+buttonnum;
	if ($(elemname).hasClass('in'))
	{
		console.log(buttonnum + " thing was previously collapsed");
		if (order[buttonnum] == 'W')
		{
			//close walking route result field and hide walking route
			walkingdirectionsDisplay.setMap(null);
    		walkingmarker1.setVisible(false);
    		walkingmarker2.setVisible(false);
		}
		else if (order[buttonnum] == 'B')
		{
			//close 1st bus route result field and hide 1st bus route
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
			//close 2nd bus route result field and hide 2nd bus route
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
			//open walking route result field and plot walking route
			walkingdirectionsDisplay.setMap(map);
    		walkingmarker1.setVisible(true);
    		walkingmarker2.setVisible(true);
		}
		else if (order[buttonnum] == 'B')
		{
			//open 1st bus route result field and plot 1st bus route
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
			//open 2nd bus route result field and plot 2nd bus route
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