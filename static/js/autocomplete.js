function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  

  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
  	  
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13 || e.keyCode == 9) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
      });
}

/*An array containing all the country names in the world:*/
var countries = ['1895 Field Dugout', 'Cannon Dial Elm Club', 'Ivy Club', 'Charter Club', 'Cottage Club','Aaron Burr Hall', 'Alexander Hall', 'Alexander Road, 693', 'Alexander Road, 755', 'Alexander Street, 20', 'Alexander Street, 228', 'Alexander Street, 262', 'Alexander Street, 262A', 'Alexander Street, 272', 'Alexander Street, 282', 'Alexander Street, 294', 'Alexander Street, 306', 'Alexander Street, 350', 'Alexander Street, 529', 'Alexander Street, 69', 'Alexander Street, 70', 'Alexander Street, 76', 'Alexander Street, 78', 'Alexander Street, 80', 'Alexander Street, 81', 'Alexander Street, 84', 'Alexander Street, 99', 'Andlinger Center', 'Architectural Laboratory', 'Architecture Building', 'Art Museum', 'Arts Tower', 'Baker Rink', 'Bendheim Center For Finance', 'Bendheim Hall', 'Berlind Theater', 'Blair Hall', 'Bloomberg Hall', 'Bobst Hall', 'Bowen Hall', 'Broadmead, 171', 'Broadmead, 185', 'Brown Hall', 'Bunn Building', 'Butler College', 'Buyers Hall', 'Caldwell Field House', 'Campbell Hall', 'Campus Club', 'Cargot Brasserie', 'Carl C. Icahn Laboratory', 'Carnegie Center, 701', 'Center for Jewish Life', 'Chambers Street, 22', 'Chancellor Green', 'Chapel', 'Charlton Street Substation', 'Charlton Street, 18-18 1/2', 'Chilled Water Plant', 'Clarke Field Dugout', 'Clarke Field Press Box', 'Class of 1879 Hall', 'Class of 1901-Laughlin Hall', 'Class of 1903 Hall', 'Class of 1915 Hall', 'Class of 1927-Clapp Hall', 'Class of 1937 Hall', 'Class of 1938 Hall', 'Class of 1939 Hall', 'Class of 1952 Stadium', 'Clio Hall', 'Cogeneration Plant', 'College Road West, 26', 'College Road, 1-14', 'Computer Science Building', 'Cordish Family Pavilion', 'Corwin Hall', 'Courtyard Annex', 'Cuyler Hall', 'Davis Building', 'DeNunzio Pool', 'Dean Mathey Garage', 'Dickinson Hall', 'Dickinson Street, 10', 'Dickinson Street, 11', 'Dickinson Street, 12-14', 'Dickinson Street, 15', 'Dickinson Street, 16', 'Dickinson Street, 2', 'Dickinson Street, 24', 'Dickinson Street, 8', 'Dillon Court East', 'Dillon Court West', 'Dillon Gymnasium', 'Dinky Bar and Kitchen', 'Dod Hall', 'Dodge Hall', 'Dodge-Osborn Hall', 'East Pyne Building', 'Edwards Hall', 'Edwards Place, 14', 'Edwards Place, 17', 'Edwards Place, 18-40', 'Edwards Place, 19', 'Edwards Place, 21', 'Edwards Place, 27', 'Edwards Place, 29', 'Edwards Place, 31', 'Elementary Particles Lab East', 'Elementary Particles Lab West', 'Elm Drive Substation', 'Elm Drive, 200', 'Engineering Quad', 'Eno Hall', 'Feinberg Hall', 'Ferris Thompson, Western Way, 20-26', 'Ferris Thompson, Western Way, 30-36', 'Ferris Thompson, Western Way, 40-46', 'Ferris Thompson, Western Way, 50-58', 'Ferris Thompson, Western Way, 60-66', 'Ferris Thompson, Western Way, 70-76', 'Ferris Thompson, Western Way, 80-86', 'Fine Hall', 'Firestone Library', 'Fisher Hall', 'FitzRandolph Observatory', 'Foulke Hall', 'Frick Chemistry Laboratory', 'Friend Center', 'Frist Campus Center', 'GBM Office Trailer', 'Gauss Hall', 'Graduate College, New', 'Graduate College, Old', 'Green Hall', 'Grinder Lab', 'Grounds Storage Building', 'Grounds Storage Shed #1', 'Grounds Storage Shed #2', 'Gulick Pavilion', 'Guyot Hall', 'Haaga House', 'Hamilton Hall', 'Harrison Street, 179, APT - 179', 'Harrison Street, 263', 'Harrison Street, Lower, 57', 'Hartley Avenue, 167', 'Hartley Avenue, 302', 'Helm Building', 'Henry Hall', 'Henry House', 'Holder Hall', 'Hoyt Chemical Laboratory', 'Ivy Lane, 5', 'Jadwin Gymnasium', 'Jadwin Hall', 'Johnstone Building', 'Joline Hall', 'Jones Hall', 'Julis Romo Rabinowitz Building', 'Launch House', 'Lawrence Drive, 1', 'Lawrence Drive, 10', 'Lawrence Drive, 11', 'Lawrence Drive, 12', 'Lawrence Drive, 13', 'Lawrence Drive, 14', 'Lawrence Drive, 2', 'Lawrence Drive, 3', 'Lawrence Drive, 4', 'Lawrence Drive, 5', 'Lawrence Drive, 6', 'Lawrence Drive, 7', 'Lawrence Drive, 8', 'Lawrence Drive, 9', 'Lewis Library', 'Little Hall', 'Lockhart Hall', 'Louis A. Simpson International Building', 'Lourie - Love Pavilion', 'Lower Harrison Street, 62', 'Lowrie House', 'MacMillan Annex', 'MacMillan Building', 'Maclean House', 'Madison Hall', 'Maeder Hall', 'Marx Hall', 'Mathey Court, Harrison Street, 289-303', 'Mathey Court, Hartley Avenue, 85-99', 'Mathey Court, Lake Lane, 18-24', 'Mathey Court, Lake Lane, 26-44', 'McCarter Theatre', 'McCormick Hall', 'McCosh Circle, 123', 'McCosh Hall', 'McCosh Infirmary', 'McDonnell Hall', 'McPartland Building', 'Mercer Street, 146', 'Mercer Street, 148', 'Mercer Street, 4', 'Meyers Building', 'Moffett Laboratory', 'Moran Building', 'Morrison Hall', 'Mudd Manuscript Library', 'Mullet Building', 'Murray Place, 19', 'Murray Place, 29', 'Murray Place, 35', 'Murray Place, 37', 'Murray Place, 39', 'Murray Place, 43', 'Murray Place, 55', 'Murray Place, 57', 'Murray Place, 59', 'Murray Theatre', 'Nassau Court, 161', 'Nassau Court, 165-167', 'Nassau Court, 171', 'Nassau Court, 177', 'Nassau Hall', 'Nassau Street, 158', 'Nassau Street, 159', 'Nassau Street, 160', 'Nassau Street, 185', 'Nassau Street, 199', 'Nassau Street, 2-4', 'Nassau Street, 201', 'Nassau Street, 221', 'New Music Building', 'New South Building', 'North Garage', 'North Guard Gate', 'Nursery Greenhouse', 'Nursery Greenhouse #2', 'Nursery Greenhouse #3', 'Nursery Greenhouse #4', 'Nursery Office', 'Nursery Shed', 'Olden Street, 15', 'Palmer House', 'Palmer House Cottage', 'Patton Hall', 'Peretsman Scully Hall', 'Peyton Hall', 'Princeton Neuroscience Institute', 'Mathey College', 'Rockefeller college', 'Princeton Stadium', 'Princeton Station', 'Prospect Avenue, 110', 'Prospect Avenue, 114', 'Prospect Avenue, 115', 'Prospect Avenue, 116', 'Prospect Avenue, 120', 'Prospect Avenue, 172-190', 'Prospect Avenue, 185', 'Prospect Avenue, 58', 'Prospect Avenue, 87', 'Prospect Avenue, 91', 'Prospect House', 'Pyne Hall', 'Roberts Stadium West Pavilion', 'Robertson Hall', 'Rock Magnetism Laboratory', 'Sailing Pavilion East', 'Sailing Pavilion West', 'Scheide Caldwell House', 'Schultz Laboratory', 'Scully Hall', 'Shea Rowing Center', 'Sherrerd Hall', 'Solar 1', 'South Guard Gate', 'Spelman Halls', 'Sports Pavilion', 'Springdale Faculty 1912 House', 'Springdale Faculty Bachelors', "Springdale Faculty Winan's House", 'Springdale Road, 40', 'Stanhope Hall', 'Stony Ford, Hopewell', 'Tennis Pavilion', 'Thomas Laboratory', 'Thompson Building', 'University Place, 11', 'University Place, 15', 'University Place, 19', 'University Place, 23', 'University Place, 27', 'University Place, 35', 'University Place, 36', 'University Place, 39', 'University Place, 41', 'University Place, 45', 'University Place, 47', 'University Place, 48', 'University Place, 71', 'Von Neumann Hall', 'Walker Hall', 'Wallace Dance Building and Theater', 'Wallace Hall', 'Wawa', 'West Garage', 'Western Way, 247', 'Whig Hall', 'Whitman College', 'Wilcox Hall', 'William Street, 40', 'William Street, 41', 'William Street, 42', 'William Street, 58-60', 'William Street, 64', 'William Street, 66', 'William Street, 68', 'Witherspoon Hall', 'Woolworth Music Center', 'Wright Hall', 'Wu Hall', 'Wyman Cottage', 'Wyman House', 'Auditorium Building, 2B', 'Auxiliary Library 12B', 'Cafeteria/Power House 9A', 'McCarter Theatre Center', 'Nassau Inn', 'Panera Bread', 'Urban Outfitters', 'Agricola Eatery', 'Princeton Record Exchange', 'Winberies Restaurant & Bar', 'Witherspoon Grill', 'Palmer Square Management LLC', '200', 'The Peacock Inn', 'Princeton University', 'Albert Einstein home', 'Elements', '84', '32', 'Bristol Myers Squibb Co: Wang Joseph', 'Student Communication Library', 'Alcord Snow Removal & Contractor', '13', 'Princeton University Art Museum', '12', 'Princeton University Swim Lessons', '16', 'Patton Hall at Princeton University', 'Wilson College', '18', 'Princeton University McCosh Health Center', '14', '11', '9', 'Department of Astrophysical Sciences', 'University Cottage Club', 'Prospect Apartments', 'Gotcher Back Certified Massage Therapy', '17', '99', 'Berkshire Hathaway HomeServices Fox & Roach', 'New Road Media', 'Blue Point Grill', '126', 'Ad Energy', 'Hoagie Haven', '100', 'St. Pauls Roman Catholic School', 'Pink Nails', 'Princeton University Press', '191', 'The Bank of Princeton', 'CVS', '21', 'Princeton Summer Theater', 'John Witherspoon Statue in Princeton University', 'Princeton University Chapel', '19', '50', 'Nassau Presbyterian Church', 'Crisis Ministry of Mercer County', '81', '174', 'Princeton University Store', 'Nassau Club', 'Ilangovan Kani M MD', 'Coldwell Banker Residential Brokerage', 'All the Worlds a Stage', '60', 'ARW BAIL BONDS', '49', 'Morven Museum & Garden', '22', 'Nassau Nursery School', '7', '6', 'General Counsel Office', 'New South (Princeton University', 'Forbes College', '4', '1', 'Princeton', 'New GC Common Room', 'Princeton Graduate College', '5', 'Dog Jogz', '2', 'Virtual Board of Advisors', 'LOT 19', 'Sebco Care', 'Dr. George F. Hutchinson Jr, DO', 'Lawrence Apartments', 'Springdale Golf Club', '3', 'Princeton Canoe Rental', 'Turning Basin Park', 'WRd. DNR Parking', 'D&R Canal Trail Pedestrian Crossing', 'LOT 21', 'Princeton Lot 21', 'Finney Field', 'Clarke Field', '8', 'Ferris Thompson Apartments', 'Class of 1926', '25', '27', 'Prospect House & Garden', '28', 'Woodrow Wilson School of Public and International Affairs', '29', '24', '106', 'PJs Pancake House', '157', '20', '43', 'Department of Operations Research and Financial Engineering', '15', 'Information Age Associates', 'Princeton Charter Club']


/*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
//alert("In here")

autocomplete(document.getElementById("myInput"), countries);
autocomplete(document.getElementById("myInput2"), countries);
