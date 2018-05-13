from flask import Flask, render_template, request, jsonify
import unirest
import sys
import polyline
import csv
import os
import json
from shapely import geometry

app = Flask(__name__)

# Function that is used to calculate arrival estimate when given routename, stopname, jsondata, timesent is used to determine if timeestimate to destination
# is greater than time estimate to source
def calculateTime(route, stop, data, timeSent):	
	time = data.body["generated_on"]
	hourtime = 0;
	if (int(time[11:13]) - 4) < 0:
		hourtime = int(time[11:13]) + 20
	else:
		hourtime = int(time[11:13]) - 4

	for data in data.body["data"]:
		if stop == data["stop_id"]:
			for arrivals in data["arrivals"]:
				if arrivals["route_id"] == route:
					minute = 0
					if int(arrivals["arrival_at"][11:13]) == hourtime:
						minute = int (arrivals["arrival_at"][14:16]) - int(time[14:16])
					else: 
						minute = int (arrivals["arrival_at"][14:16]) - int(time[14:16]) + 60
					if timeSent < minute:
						return minute

@app.route('/FastTrackPython', methods=['GET', 'POST'])
def hello():
	# returned content is a 2D array that contains information about the top 3 routes and is returned to the front end at the end
	returnedcontent = []
	
	src = str(request.args.get('src'))
	dst = str(request.args.get('dst'))
	
	# 1: find closest bus stops to user
	mapskey = "AIzaSyDpp8voCHf0PvvD46oNJUQCj4xxhvXcN9U"
	#a: get lat and long of user
	lat = ''
	longitude = ''
	# Condition to deal with if user decides to use own location or inputs a source
	if src.startswith("usercoordsused"):
		coords = src[14:]
		lat, longitude = coords.split(',')
	else:
		location = unirest.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + src + "+Princeton+NJ&key=" + mapskey)
		lat = location.body["results"][0]["geometry"]["location"]["lat"]
		longitude = location.body["results"][0]["geometry"]["location"]["lng"]
		
	origlat = lat
	origlongitude = longitude

	latsource = str(lat)[:10]
	longitudesource = str(longitude)[:10]


	# import static files stop.json and routes.json
	with open("stops.json") as json_file:
	 	stops = json.load(json_file)

	with open("routes.json") as json_file:
	 	routes = json.load(json_file)

	# name of stop around user to stop_id
	sourcenametoidtable = {}
	# name of stop around user to lat and long
	sourcenametolatlongtable = {}
	# stop id to name 
	sourceidtonametable = {}

	point1 = geometry.Point(float(lat), float(longitude))
	circle_buffer = point1.buffer(0.003)

	# build some useful tables based on stops around user location
	for names in stops["data"]:
		point2 = geometry.Point(float(names["location"]["lat"]), float(names["location"]["lng"]))
		if point2.within(circle_buffer):
			sourcenametoidtable[names["name"]] = names["stop_id"]
			sourcenametolatlongtable[names["name"]] = str(names["location"]["lat"]) + "," + str(names["location"]["lng"])
			sourcenametoroutes[names["name"]] = names["routes"]
			sourceidtonametable[names["stop_id"]] = names["name"]

	# string used in API call
	inputString = ""
	for name in sourcenametoidtable:
		inputString += sourcenametoidtable[name] + "%2c"
		
	# get stops around user destination
	location = unirest.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + dst + "+Princeton+NJ&key=" + mapskey)
	lat = location.body["results"][0]["geometry"]["location"]["lat"]
	longitude = location.body["results"][0]["geometry"]["location"]["lng"]

	latdest = str(lat)[:10]
	longitudedest = str(longitude)[:10]

	point3 = geometry.Point(float(lat), float(longitude))
	circle_buffer = point3.buffer(0.003)

	# doing same thing here to build useful tables around user destination
	destidtonametable = {}
	destnametoidtable = {}
	destnametolatlongtable = {}

	for name in stops["data"]:
		point4 = geometry.Point(float(name["location"]["lat"]), float(name["location"]["lng"]))
		if point4.within(circle_buffer):
			destidtonametable[name["stop_id"]] = name["name"]
			destnametoidtable[name["name"]] = name["stop_id"]
			destnametolatlongtable[name["name"]] = str(name["location"]["lat"]) + "," + str(name["location"]["lng"])

	inputStringDest = ""
	for name in destnametoidtable:
		inputStringDest += destnametoidtable[name] + "%2c"
		

	# active route to stops along that route
	activeroutestostops = {}
	# active route to stops around source
	activeroutetosourcename = {}
	# acrive route to stops around dest
	activeroutetodestname = {}
	# active route to name of route
	activeroutetoroutename = {}

	# Note: Could have combined both API calls into one but it took more time to fetch and parse results
	# API call to get arrival estimates of buses to stops around source
	arrivalestimates = unirest.get("https://transloc-api-1-2.p.mashape.com/arrival-estimates.json?agencies=84&callback=call&stops=" + inputString[:-3],
		headers={
		"X-Mashape-Key": "ru3kH1sHwXmsh30DK5Si5rtDGblOp1tcBfHjsnxSwtKVjwYvLp",
		"Accept": "application/json"
		}
	)
	# API call to get arrival estimates of byses to stops around dest
	arrivalestimatesDest = unirest.get("https://transloc-api-1-2.p.mashape.com/arrival-estimates.json?agencies=84&callback=call&stops=" + inputStringDest[:-3],
		headers={
		"X-Mashape-Key": "ru3kH1sHwXmsh30DK5Si5rtDGblOp1tcBfHjsnxSwtKVjwYvLp",
		"Accept": "application/json"
		}
	)


	for arrivals in arrivalestimates.body["data"]:
		for allroutes in routes["data"]["84"]:
			if allroutes["route_id"] == arrivals["arrivals"][0]["route_id"] and allroutes["route_id"] not in activeroutestostops.keys():
				activeroutestostops[allroutes["route_id"]] = allroutes["stops"]
				activeroutetoroutename[allroutes["route_id"]] = allroutes["long_name"]
				activeroutetosourcename[allroutes["route_id"]] = []
				activeroutetodestname[allroutes["route_id"]] = []

	for arrivals in arrivalestimatesDest.body["data"]:
		for allroutes in routes["data"]["84"]:
			if allroutes["route_id"] == arrivals["arrivals"][0]["route_id"] and allroutes["route_id"] not in activeroutestostops.keys():
				activeroutestostops[allroutes["route_id"]] = allroutes["stops"]
				activeroutetoroutename[allroutes["route_id"]] = allroutes["long_name"]
				activeroutetodestname[allroutes["route_id"]] = []
				activeroutetosourcename[allroutes["route_id"]] = []

	for route in activeroutestostops:
		for stop in activeroutestostops[route]:
			for sourcestop in sourceidtonametable:
				if stop == sourcestop and route in activeroutetosourcename.keys():
					activeroutetosourcename[route].append(sourceidtonametable[stop])

	for route in activeroutestostops:
		for stop in activeroutestostops[route]:
			for sourcestop in destidtonametable:
				if stop == sourcestop and route in activeroutetodestname.keys():	

	# source stop to walking time from source to source stop
	walkingtimeSource = {}
	# Destination stop to walking time from destination to destination stop
	walkingtimeDest = {}
	# for every possible source stop find how long it would take to walk from source to stop
	for route in activeroutetosourcename:
		for sourcename in activeroutetosourcename[route]:
			googlewalking = unirest.get("https://maps.googleapis.com/maps/api/distancematrix/json?origins=" + sourcenametolatlongtable[sourcename] + "&destinations=" + latsource +"," + longitudesource + 
					"&mode=walking&key=" + mapskey)
			walkingtimeSource[sourcename] = int (googlewalking.body["rows"][0]["elements"][0]["duration"]["text"].split(" ")[0])

	for route in activeroutetodestname:
		for destname in activeroutetodestname[route]:
			googlewalking = unirest.get("https://maps.googleapis.com/maps/api/distancematrix/json?origins=" + destnametolatlongtable[destname] + "&destinations=" + latdest +"," + longitudedest + 
					"&mode=walking&key=" + mapskey)
			walkingtimeDest[destname] = int (googlewalking.body["rows"][0]["elements"][0]["duration"]["text"].split(" ")[0])

	googlewalking = unirest.get("https://maps.googleapis.com/maps/api/distancematrix/json?origins=" + latsource +"," + longitudesource + "&destinations=" + latdest +"," + longitudedest + 
					"&mode=walking&key=" + mapskey)
	# total walking time used to compare v.s bus times
	walkingtotal = int (googlewalking.body["rows"][0]["elements"][0]["duration"]["text"].split(" ")[0])

	besttime = 1000
	secondbesttime = 1000
	returnedcontent.append([])
	returnedcontent.append([])
	time = arrivalestimates.body["generated_on"]
	# dealing with case when its night time and on demand bus is running
	if (int(time[11:13]) - 4) < 0:
		hourtime = int(time[11:13]) + 20
	else:
		hourtime = int(time[11:13]) - 4
	if hourtime > 21 or hourtime < 3:
		returnedcontent[0].append("Sorry there are no busses running right now.You can request the On demand bus by calling 609-258-7433 and it will drop you off wherever you want!")
	elif len(activeroutetoroutename) == 0:
		returnedcontent[0].append("Sorry there are no busses running right now. Time to stretch your legs!")
	else:
		returnedcontent[0].append("Sorry there are no busses that connect you to your destination. Try another start location!")
		
	returnedcontent[0].append("")
	returnedcontent[0].append("")
	returnedcontent[1].append("")
	returnedcontent[1].append("")
	returnedcontent[1].append("")

	bestroute = ""
	bestsrc = ""
	bestdst = ""
	# doing calculations to find optimal bus time. Algorithm is as follow: For every route in active route source look at every source stop along the route and 
	# calculate the time it takes to get to every destination stop a long that route based on arrival estimate times.
	for route in activeroutetosourcename:
		for sourcename in activeroutetosourcename[route]:
			sourcetime =    calculateTime(route,sourcenametoidtable[sourcename], arrivalestimates, 0)
			
			for destname in activeroutetodestname[route]:

				desttime = calculateTime(route,destnametoidtable[destname],arrivalestimatesDest, sourcetime)
				walktimedest = walkingtimeDest[destname]
				walktimesrc = walkingtimeSource[sourcename]

				# walktimesrc + walktimedest + sourcetime + desttime > totalwalktime
				if sourcetime is not None and desttime is not None and walktimesrc + walktimedest + desttime < besttime:
					secondbesttime = besttime
					secondbestroute = bestroute
					secondbestsrc = bestsrc
					secondbestdst = bestdst

					returnedcontent[1][0] = returnedcontent[0][0]
					returnedcontent[1][1] = returnedcontent[0][1]
					returnedcontent[1][2] = returnedcontent[0][2]

					besttime = walktimesrc+ walktimedest + desttime
					bestroute = str(activeroutetoroutename[route])
					bestsrc = str(sourcename)
					bestdst = str(destname)
					returnedcontent[0][0] = "1. Walk along yellow route for " + str(walktimesrc) + " mins to reach "+ str(sourcename) + " stop. Bus will arrive to stop in " + str(sourcetime) + " mins." + '<br>'
					returnedcontent[0][1] = "2. Take " + str(activeroutetoroutename[route]) + " bus along blue route for " + str(desttime - sourcetime) + " mins and will drop you off at " + str(destname) + " stop."
					returnedcontent[0][2] = "3. Walk along green route for " + str(walktimedest) + " mins to reach your final destination"

				elif sourcetime is not None and desttime is not None and walktimesrc + walktimedest + desttime < secondbesttime:
					secondbesttime = walktimesrc + walktimedest + desttime 
					secondbestroute = str(activeroutetoroutename[route])
					secondbestsrc = str(sourcename)
					secondbestdst = str(destname)
					returnedcontent[1][0] =  "1. Walk along yellow route for " +  str(walktimesrc) + " mins to reach "+ str(sourcename) + " stop. Bus will arrive to stop in " + str(sourcetime) + " mins." + '<br>'
					returnedcontent[1][1] =  "2. Take " + str(activeroutetoroutename[route]) + " bus along blue route for " + str(desttime - sourcetime) + " mins and will drop you off at " + str(destname) + " stop."
					returnedcontent[1][2] =  "3. Walk along green route for " + str(walktimedest) + " mins to reach your final destination"
	
	# dealing with case when there are no buses						
	if returnedcontent[0][0].split(" ")[0] == "Sorry":
		del returnedcontent[1]
		returnedcontent.append(["walking route"])
		returnedcontent[1].append(walkingtotal)
		returnedcontent[1].append(latdest +"," + longitudedest )
		return jsonify(result=returnedcontent)


	finalhash = ''
	rownum = 0
	allcoords = []
	prevcoords = []
	firstrowofcoords = 1

	currindex = 0
	startindex = -1
	endindex = -1
	bestroute = bestroute.replace('/', ' ')
	filename = bestroute + ".csv"
	fileroute = os.path.join('.', 'New Polylines/' + filename)
	
	# Accessing polyline file and concatenating polyline encodings based on source and dest stop
	with open(fileroute) as csvfile:
		readCSV = csv.reader(csvfile, delimiter=',')
		for row in readCSV:
			if rownum == 0:
				rownum = 1
			else:
				if row[0] == bestsrc and startindex == -1:
					startindex = currindex
				if row[1] == bestdst and endindex == -1:
					endindex = currindex
				currcoords = polyline.decode(row[2])
				if firstrowofcoords == 1:
					firstrowofcoords = 0
				else:
					currcoords[0] = prevcoords[len(prevcoords) - 1]
				prevcoords = currcoords
				allcoords.append(currcoords)
				currindex += 1
	allcoords[len(allcoords) - 1][len(currcoords) - 1] = allcoords[0][0]

	
	aggregated = []

	if startindex > endindex:
		for i in range(startindex, len(allcoords)):
			aggregated += allcoords[i]
		for i in range(0, endindex+1):
			aggregated += allcoords[i]
	else:
		for i in range(startindex, endindex+1):
			aggregated += allcoords[i]

	returnedcontent[0].append(polyline.encode(aggregated))  #adding aggregated bus hashed poyline


	returnedcontent[0].append(sourcenametolatlongtable[bestsrc])  # addiing location of src stop
	returnedcontent[0].append(destnametolatlongtable[bestdst])  # addiing location of dst stop
	returnedcontent[0].append(latdest +"," + longitudedest ) # adding lat and long of destination
	returnedcontent[0].append(str(bestsrc) + " Stop") # adding name of source stop
	returnedcontent[0].append(str(bestdst)  + " Stop") # adding name of destination stop
	returnedcontent[0].append(str(besttime)) # adding total trip time
	# if there is a second bus route do the following
	if (not returnedcontent[1][0].startswith("Sorry")):
		finalhash = ''
		rownum = 0
		allcoords = []
		prevcoords = []
		firstrowofcoords = 1

		currindex = 0
		startindex = -1
		endindex = -1
		secondbestroute = secondbestroute.replace('/', ' ')
		filename = secondbestroute + ".csv"
		fileroute = os.path.join('.', 'New Polylines/' + filename)

		with open(fileroute) as csvfile:
			readCSV = csv.reader(csvfile, delimiter=',')
			#returnedcontent[0] = returnedcontent[0] + "    reached hererererer"
			#return jsonify(result=returnedcontent)
			for row in readCSV:
				if rownum == 0:
					rownum = 1
				else:
					if row[0] == secondbestsrc and startindex == -1:
						startindex = currindex
					if row[1] == secondbestdst and endindex == -1:
						endindex = currindex
					currcoords = polyline.decode(row[2])
					if firstrowofcoords == 1:
						firstrowofcoords = 0
					else:
						currcoords[0] = prevcoords[len(prevcoords) - 1]
					prevcoords = currcoords
					allcoords.append(currcoords)
					currindex += 1
		allcoords[len(allcoords) - 1][len(currcoords) - 1] = allcoords[0][0]

		
		aggregated = []

		if startindex > endindex:
			for i in range(startindex, len(allcoords)):
				aggregated += allcoords[i]
			for i in range(0, endindex+1):
				aggregated += allcoords[i]
		else:
			for i in range(startindex, endindex+1):
				aggregated += allcoords[i]

		returnedcontent[1].append(polyline.encode(aggregated))  #adding aggregated bus hashed poyline


		returnedcontent[1].append(sourcenametolatlongtable[secondbestsrc])  #addiing location of src stop
		returnedcontent[1].append(destnametolatlongtable[secondbestdst])  #addiing location of dst stop
		returnedcontent[1].append(latdest +"," + longitudedest) # adding lat and long of destination
		returnedcontent[1].append(str(secondbestsrc) + " Stop") # adding name of source stop
		returnedcontent[1].append(str(secondbestdst)  + " Stop") # adding name of dest stop
		returnedcontent[1].append(str(secondbesttime)) # adding best time

		returnedcontent.append(["walking route"]) # adding walking route signifier
		returnedcontent[2].append(walkingtotal) # adding walking route time

		returnedcontent.append(["walking route"])
		returnedcontent[2].append(walkingtotal)
		returnedcontent[2].append(latdest +"," + longitudedest )
	else:
		del returnedcontent[1]
		returnedcontent.append(["walking route"])
		returnedcontent[1].append(walkingtotal)
		returnedcontent[1].append(latdest +"," + longitudedest )


	if float(returnedcontent[len(returnedcontent) - 1][1]) < float(returnedcontent[0][9]):
		temp = returnedcontent[0]
		del returnedcontent[0]
		returnedcontent.insert(0, returnedcontent[len(returnedcontent) - 1])
		if len(returnedcontent) == 3:
			returnedcontent.insert(len(returnedcontent) - 2, temp)
		else:
			returnedcontent.insert(len(returnedcontent) - 1, temp)
		del returnedcontent[len(returnedcontent) - 1]

	return jsonify(result=returnedcontent)

#, methods=['GET', 'POST']
@app.route('/')
def index():
	return render_template('index.html')
 
if __name__ == "__main__":
 	app.run(debug=True)
 	
