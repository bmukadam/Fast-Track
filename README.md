### FastTrack - _Get There Faster_

COS 33 Spring 2018

_“Everyone knows that debugging is twice as hard as writing a program in the first place. So if you're as clever as you can be when you write it, how will you ever debug it?”_ **- Brian W. Kernighan**

## Team Members

|Abdulghafar Al Tair (fearless leader) atair@princeton.edu|Bilal Mukadam bmukadam@princeton.edu|Mahd Khan mahdk@princeton.edu|
| :-------------: |:-------------:| :-------------:|
| ![alt=pic](https://github.com/BidoTair/Fast-Track/blob/master/IMG_0034.JPG) | ![alt=pic1](https://github.com/BidoTair/Fast-Track/blob/master/bilal.jpg)| ![alt=pic2](https://github.com/BidoTair/Fast-Track/blob/master/mahd.jpg) |


**TA:** Ashley King

## Design Document
[Check it out!](https://github.com/BidoTair/Fast-Track/blob/master/Abdulghafar_AlTair.pdf)
## Timeline
```markdown

 - February 20th: Our group met with Professor Kernighan to discuss potential project 
   ideas

 - March 17th: Design Document Due
 
 - March 20th: Setup Github Repository and make sure all team members are aware of 
    how to utilize the system

 - March 24th: Complete UI for main page (includes search fields, map navigation 
    section, and route details/timing section), Research Google Maps API. Setup hosting on Heroku
 
 - March 25th: Have project landing page (Project Status web page) setup and linked
    to main webpage.
 
 - March 26-28th: How to access bus data feed and possibly organize it for our purposes. 
 
 - March: 31st: Add CAS access to our platform.
 
 - March 31-April 13th: Expanding on what we have already, adding logic and decision making. 
   Specifically, want to have the feature where it tells user which bus to take from a given 
   point running. This only   incorporates the “bus-taking” aspect of the route, not the “walking” 
   aspect. In other words, it does not use the combination of the two to provide the most optimal 
   route. Will format data give to us by TigerTransit into two sections. One consists of all the 
   current bus routes, in segments. The other has the operating bus stops. We will store these forms 
   of data in two seperate tables and parse user input to query the appropriate table to obtain the 
   route segment. Use that segment in conjunction with Google Maps API to obtain the average travel 
   time between those two points.

 - April 13th: Project Prototype Due

 - April 13-27th:
   Add on walking to bus-stops, “is walking better than bus”
   Incorporate logic to figure out optimal route. We anticipate that optimal routes 
   will be calculated as a function of: 
           1- Nearest Bus Stop in terms of walk-time
           2- Minimum bus arrival time
   Create “test user” objects by using our own accounts and test how the app responds to different 
   types of input and see if    it gives the correct expected output i.e. the optimal route.
   Finish up loose ends, thoroughly test the application and debug corner/tricky cases

- April 27- May 4th: Alpha Test
  Launch the application for general public use. Obtain feedback from users (either within the app or verbally) 
  and use that feedback to adjust the response of the application.
  Opening the application to the public creates stress and boundary test cases automatically, which will be 
  helpful in the overall testing of the application and smooth out the edges

 - May 4-9th: Beta Test 
   Buffer zone for if things did not meet deadlines and some parts of the implementation were delayed. 
   In a perfect scenario, this time would be used to write the report

 - May 9-10th: Demo Days in Class
 
 - May 13th: Project Due
```
