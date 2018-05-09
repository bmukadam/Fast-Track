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
	
	returnedcontent = []
	# src and dest are received from index.html
	src = str(request.args.get('src'))
	dst = str(request.args.get('dst'))
	
	# 1: find closest bus stops to user
	mapskey = "AIzaSyDpp8voCHf0PvvD46oNJUQCj4xxhvXcN9U"
	#a: get lat and long of user
	lat = ''
	longitude = ''
	
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


	with open("stops.json") as json_file:
	 	stops = json.load(json_file)

	with open("routes.json") as json_file:
	 	routes = json.load(json_file)

	sourcenametoidtable = {}
	sourcenametolatlongtable = {}
	sourcenametoroutes = {}
	sourceidtonametable = {}
	sourceroutetoarrival = {}
	destroutetoarrival = {}

	point1 = geometry.Point(float(lat), float(longitude))
	circle_buffer = point1.buffer(0.003)

	# build some useful tables
	for names in stops["data"]:
		point2 = geometry.Point(float(names["location"]["lat"]), float(names["location"]["lng"]))
		if point2.within(circle_buffer):
			sourcenametoidtable[names["name"]] = names["stop_id"]
			sourcenametolatlongtable[names["name"]] = str(names["location"]["lat"]) + "," + str(names["location"]["lng"])
			sourcenametoroutes[names["name"]] = names["routes"]
			sourceidtonametable[names["stop_id"]] = names["name"]


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
		

	routestostops = {}
	activeroutes = {}
	activeroutetosourcename = {}
	activeroutetodestname = {}
	activeroutetoroutename = {}


					


	arrivalestimates = unirest.get("https://transloc-api-1-2.p.mashape.com/arrival-estimates.json?agencies=84&callback=call&stops=" + inputString[:-3],
		headers={
		"X-Mashape-Key": "ru3kH1sHwXmsh30DK5Si5rtDGblOp1tcBfHjsnxSwtKVjwYvLp",
		"Accept": "application/json"
		}
	)

	arrivalestimatesDest = unirest.get("https://transloc-api-1-2.p.mashape.com/arrival-estimates.json?agencies=84&callback=call&stops=" + inputStringDest[:-3],
		headers={
		"X-Mashape-Key": "ru3kH1sHwXmsh30DK5Si5rtDGblOp1tcBfHjsnxSwtKVjwYvLp",
		"Accept": "application/json"
		}
	)


	
	for arrivals in arrivalestimates.body["data"]:
		for allroutes in routes["data"]["84"]:
			if allroutes["route_id"] == arrivals["arrivals"][0]["route_id"] and allroutes["route_id"] not in routestostops.keys():
				routestostops[allroutes["route_id"]] = allroutes["stops"]
				activeroutetoroutename[allroutes["route_id"]] = allroutes["long_name"]
				activeroutetosourcename[allroutes["route_id"]] = []
				activeroutetodestname[allroutes["route_id"]] = []

	for arrivals in arrivalestimatesDest.body["data"]:
		for allroutes in routes["data"]["84"]:
			if allroutes["route_id"] == arrivals["arrivals"][0]["route_id"] and allroutes["route_id"] not in routestostops.keys():
				routestostops[allroutes["route_id"]] = allroutes["stops"]
				activeroutetoroutename[allroutes["route_id"]] = allroutes["long_name"]
				activeroutetodestname[allroutes["route_id"]] = []
				activeroutetosourcename[allroutes["route_id"]] = []

	for route in routestostops:
		for stop in routestostops[route]:
			for sourcestop in sourceidtonametable:
				if stop == sourcestop and route in activeroutetosourcename.keys():
					activeroutetosourcename[route].append(sourceidtonametable[stop])

	for route in routestostops:
		for stop in routestostops[route]:
			for sourcestop in destidtonametable:
				if stop == sourcestop and route in activeroutetodestname.keys():					
					activeroutetodestname[route].append(destidtonametable[stop])

	walkingtimeSource = {}
	walkingtimeDest = {}

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
	walkingtotal = int (googlewalking.body["rows"][0]["elements"][0]["duration"]["text"].split(" ")[0])

	#orange then blue then green
	besttime = 1000
	secondbesttime = 1000
	returnedcontent.append([])
	returnedcontent.append([])
	if len(activeroutetoroutename) == 1:
		returnedcontent[0].append("Sorry there are no busses running right now. Time to stretch your legs!")
	else:
		returnedcontent[0].append("Sorry there are no busses that connect you to your destination. Try another location!")
	returnedcontent[0].append("")
	returnedcontent[0].append("")
	returnedcontent[1].append("")
	returnedcontent[1].append("")
	returnedcontent[1].append("")

	bestroute = ""
	bestsrc = ""
	bestdst = ""
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
	#returnedcontent[0] = returnedcontent[0] + "    fileroute: " + str(fileroute) + " filename: " + str(filename)
	#return jsonify(result=returnedcontent)

	with open(fileroute) as csvfile:
		readCSV = csv.reader(csvfile, delimiter=',')
		#returnedcontent[0] = returnedcontent[0] + "    reached hererererer"
		#return jsonify(result=returnedcontent)
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


	returnedcontent[0].append(sourcenametolatlongtable[bestsrc])  #addiing location of src stop
	returnedcontent[0].append(destnametolatlongtable[bestdst])  #addiing location of dst stop
	# editeddst = dst.replace(' ', '+')
	# destinfo = unirest.get("https://maps.googleapis.com/maps/api/geocode/json?address="+editeddst+",+Princeton,+NJ&key=" + mapskey)
	# destcoords = str(destinfo.body["results"][0]["geometry"]["location"]["lat"]) + "," + str(destinfo.body["results"][0]["geometry"]["location"]["lng"]) #location of ultimate dest
	returnedcontent[0].append(latdest +"," + longitudedest )
	returnedcontent[0].append(str(bestsrc) + " Stop")
	returnedcontent[0].append(str(bestdst)  + " Stop")
	returnedcontent[0].append(str(besttime))

	if (returnedcontent[1][0] != ""):
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
		#returnedcontent[0] = returnedcontent[0] + "    fileroute: " + str(fileroute) + " filename: " + str(filename)
		#return jsonify(result=returnedcontent)

		with open(fileroute) as csvfile:
			readCSV = csv.reader(csvfile, delimiter=',')
			#returnedcontent[0] = returnedcontent[0] + "    reached hererererer"
			#return jsonify(result=returnedcontent)
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

		returnedcontent[1].append(polyline.encode(aggregated))  #adding aggregated bus hashed poyline


		returnedcontent[1].append(sourcenametolatlongtable[secondbestsrc])  #addiing location of src stop
		returnedcontent[1].append(destnametolatlongtable[secondbestdst])  #addiing location of dst stop
		# editeddst = dst.replace(' ', '+')
		# destinfo = unirest.get("https://maps.googleapis.com/maps/api/geocode/json?address="+editeddst+",+Princeton,+NJ&key=" + mapskey)
		# destcoords = str(destinfo.body["results"][0]["geometry"]["location"]["lat"]) + "," + str(destinfo.body["results"][0]["geometry"]["location"]["lng"]) #location of ultimate dest
		returnedcontent[1].append(latdest +"," + longitudedest)
		returnedcontent[1].append(str(secondbestsrc) + " Stop")
		returnedcontent[1].append(str(secondbestdst)  + " Stop")
		returnedcontent[1].append(str(secondbesttime))

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
 	
