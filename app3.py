from flask import Flask, render_template, request
import unirest
import sys

app = Flask(__name__)

@app.route('/FastTrackPython', methods=['GET', 'POST'])
def hello():
	#if request.method == 'POST':
	#src = str(request.form['src'])
	#dst = str(request.form['dst'])
	#output = "Length of src was: " + str(len(src)) + " and recieved data was: " + src + "\n" + 	"Length of dst was: " + str(len(dst)) + " and recieved data was: " + dst

	# 1: find closest bus stops to user
	mapskey = "AIzaSyDvHgiADUnMOPhrlPWWtHnXpcFXjgUhSyc"

	#a: get lat and long of user
	location = unirest.get("https://maps.googleapis.com/maps/api/geocode/json?address=Friend Center+Princeton+NJ&key=" + mapskey)
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
	location = unirest.get("https://maps.googleapis.com/maps/api/geocode/json?address=Frist center+Princeton+NJ&key=" + mapskey)
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

	destnametoidtable = {}
	for name in response2.body["data"]:
		destnametoidtable[name["stop_id"]] = name["name"]

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
		
	for route in routestostops:
		for rname in sourcenametoroutes:
			for routeinarray in sourcenametoroutes[rname]:
				if routeinarray == route:
					activeroutes[route] = routestostops[route]
					activeroutetoname[route] = rname


	arrivalestimates = unirest.get("https://transloc-api-1-2.p.mashape.com/arrival-estimates.json?agencies=84&callback=call&stops=" + inputString[:-3],
		headers={
		"X-Mashape-Key": "ru3kH1sHwXmsh30DK5Si5rtDGblOp1tcBfHjsnxSwtKVjwYvLp",
		"Accept": "application/json"
		}
	)

	time = arrivalestimates.body["generated_on"]

	for data in arrivalestimates.body["data"]:
		for arrivals in data["arrivals"]:
			if arrivals["route_id"] in activeroutes:
				sourceroutetoarrival[arrivals["route_id"]] = int (arrivals["arrival_at"][14:16]) - int(time[14:16])
	
	for stop in destnametoidtable:
		for route in activeroutes:
			for stopinarray in activeroutes[route]:
				if stopinarray == stop:
					output = 'Walk to ' + activeroutetoname[route] + ' stop and take bus to ' + destnametoidtable[stop] + ' stop'
					output = output + ' average time is ' + str(sourceroutetoarrival[str(route)]) + ' route name ' + activeroutetoroutename[route]
					#print output
	return output

#, methods=['GET', 'POST']
@app.route('/')
def index():
	return render_template('index.html')
 
if __name__ == "__main__":
    app.run(debug=True)