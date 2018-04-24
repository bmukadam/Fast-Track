from flask import Flask, render_template, request, jsonify
import unirest
import sys

app = Flask(__name__)

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
	#if request.method == 'POST':
	returnedcontent = []
	src = str(request.args.get('src'))
	dst = str(request.args.get('dst'))
	polyline_output =  "msguFphsfMpEjWdQ}LdGmEhFkDlB{AlC}B??w@cBk@u@cA_AwB}A]Y}@gAYc@a@_AMa@UeA"
	returnedcontent.append(polyline_output)
	#return jsonify(result=output)
	#src = str(request.form['src']) 
	#dst = str(request.form['dst'])
	#output = "Length of src was: " + str(len(src)) + " and recieved data was: " + src + "\n" + 	"Length of dst was: " + str(len(dst)) + " and recieved data was: " + dst

	# 1: find closest bus stops to user
	mapskey = "AIzaSyDvHgiADUnMOPhrlPWWtHnXpcFXjgUhSyc"

	#a: get lat and long of user
	location = unirest.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + src + "+Princeton+NJ&key=" + mapskey)
	lat = location.body["results"][0]["geometry"]["location"]["lat"]
	longitude = location.body["results"][0]["geometry"]["location"]["lng"]

	lat = str(lat)[:10]
	longitude = str(longitude)[:10]


	# get stops around user source
	response = unirest.get("https://transloc-api-1-2.p.mashape.com/stops.json?agencies=84&callback=call&geo_area=" + lat 
		+ "%2C" + longitude + "%7C200", 
		headers={
	    "X-Mashape-Key": "ru3kH1sHwXmsh30DK5Si5rtDGblOp1tcBfHjsnxSwtKVjwYvLp",
	    "Accept": "application/json"
	  }
	)

	sourcenametoidtable = {}
	sourcenametolatlongtable = {}
	sourcenametoroutes = {}
	sourceidtonametable = {}
	sourceroutetoarrival = {}
	destroutetoarrival = {}

	# build some useful tables
	for names in response.body["data"]:
		sourcenametoidtable[names["name"]] = names["stop_id"]
		sourcenametolatlongtable[names["name"]] = (names["location"]["lat"], names["location"]["lng"])
		sourcenametoroutes[names["name"]] = names["routes"]
		sourceidtonametable[names["stop_id"]] = names["name"]

	

	inputString = ""
	for name in sourcenametoidtable:
		inputString += sourcenametoidtable[name] + "%2c"
	



	# get stops around user destination
	location = unirest.get("https://maps.googleapis.com/maps/api/geocode/json?address=" + dst + "Princeton+NJ&key=" + mapskey)
	lat = location.body["results"][0]["geometry"]["location"]["lat"]
	longitude = location.body["results"][0]["geometry"]["location"]["lng"]

	lat = str(lat)[:10]
	longitude = str(longitude)[:10]

	response2 = unirest.get("https://transloc-api-1-2.p.mashape.com/stops.json?agencies=84&callback=call&geo_area=" + lat 
		+ "%2C" + longitude + "%7C200", 
		headers={
	    "X-Mashape-Key": "ru3kH1sHwXmsh30DK5Si5rtDGblOp1tcBfHjsnxSwtKVjwYvLp",
	    "Accept": "application/json"
	  }
	)

	destidtonametable = {}
	destnametoidtable = {}
	for name in response2.body["data"]:
		destidtonametable[name["stop_id"]] = name["name"]
		destnametoidtable[name["name"]] = name["stop_id"]

	inputStringDest = ""
	for name in destnametoidtable:
		inputStringDest += destnametoidtable[name] + "%2c"

	# build a table with route_id as keys and stops array as value
	response1 = unirest.get("https://transloc-api-1-2.p.mashape.com/routes.json?agencies=84&callback=call",
	  headers={
	    "X-Mashape-Key": "ru3kH1sHwXmsh30DK5Si5rtDGblOp1tcBfHjsnxSwtKVjwYvLp",
	    "Accept": "application/json"
	  }
	)

	routestostops = {}
	activeroutes = {}
	activeroutetoname = {}
	activeroutetoroutename = {}
	for routes in response1.body["data"]["84"]:
		if routes["is_active"] == True:
			routestostops[routes["route_id"]] = routes["stops"]
			activeroutetoroutename[routes["route_id"]] = routes["long_name"]
			activeroutetosourcename[routes["route_id"]] = [] 
			activeroutetodestname[routes["route_id"]] = []
	
	for route in routestostops:
		for stop in routestostops[route]:
			for sourcestop in sourceidtonametable:
				if stop == sourcestop:
					activeroutetosourcename[route].append(sourceidtonametable[stop])

	for route in routestostops:
		for stop in routestostops[route]:
			for sourcestop in destidtonametable:
				if stop == sourcestop:
					activeroutetodestname[route].append(destidtonametable[stop])


	arrivalestimates = unirest.get("https://transloc-api-1-2.p.mashape.com/arrival-estimates.json?agencies=84&callback=call&stops=" + inputString[:-3],
		headers={
		"X-Mashape-Key": "ru3kH1sHwXmsh30DK5Si5rtDGblOp1tcBfHjsnxSwtKVjwYvLp",
		"Accept": "application/json"
		}
	)

	arrivalestimatesdest = unirest.get("https://transloc-api-1-2.p.mashape.com/arrival-estimates.json?agencies=84&callback=call&stops=" + inputStringDest[:-3],
		headers={
		"X-Mashape-Key": "ru3kH1sHwXmsh30DK5Si5rtDGblOp1tcBfHjsnxSwtKVjwYvLp",
		"Accept": "application/json"
		}
	)

	mintime = 100
	output = ""
	for route in activeroutetosourcename:
		for sourcename in activeroutetosourcename[route]:
			for destname in activeroutetodestname[route]:
				sourcetime = calculateTime(route,sourcenametoidtable[sourcename], arrivalestimates, 0)
				desttime = calculateTime(route,destnametoidtable[destname],arrivalestimatesdest, sourcetime)

				if sourcetime is not None and desttime is not None and desttime < mintime:
					mintime = desttime
					output = 'Walk to ' + str(sourcename) + ' stop and take bus to ' + str(destname) + ' stop'
					output = output + ' time for bus to come is ' + str(sourcetime) + ' route name ' + activeroutetoroutename[route]
					output = output + ' total trip time is ' + str(desttime)
	returnedcontent.append(output)
					
					#output = output + '<br>'
					#print output
	#return output
	#return render_template('index.html', route_results=output)
	#returnedcontent.append(output)
	return jsonify(result=returnedcontent)

#, methods=['GET', 'POST']
@app.route('/')
def index():
	return render_template('index.html')
 
if __name__ == "__main__":
    app.run(debug=True)