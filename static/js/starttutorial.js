/***************************************************************************
 * This code starts the tutorial and specfies the order of the tutorial, and
 * the corresponding text that appears during each step of the tutorial.
 ***************************************************************************/

function starttutorial() {
	var intro = introJs();
  intro.setOptions({
  steps: [
    { 
      intro: "Welcome to the FastTrack tutorial!"
    },
    {
      element: '#myInput',
      intro: "If you want to use your current location, leave this field blank. Otherwise, type where you would like your trip to begin (tip: use arrow keys to interact with autocomplete, and tab to \"select\")",
      position: 'right'
    },
    {
      element: '#myInput2',
      intro: "Enter where you would like to end your trip.",
      position: 'right'
    },
    {
      element: '#results_body',
      intro: 'Results will show you up to three possible routes that will be ordered in increasing trip-completion time. Click on each heading to get more info and to display the corresponding plotted route. The best route is plotted by default',
      position: 'right'
    },
    {
      element: '#map',
      intro: "The routes will be displayed here!"
    }
  ]
  });
	intro.start();
};	
