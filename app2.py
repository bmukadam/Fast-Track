
import cherrypy
from jinja2 import Environment, FileSystemLoader
from flask import Flask
from flask import request
env = Environment(loader=FileSystemLoader('html'))

app = Flask(__name__)
 
#, methods=['GET', 'POST']
#@app.route('/FastTrackPython', methods=['GET', 'POST'])
@cherrypy.expose
def hello():
	#if request.method == 'POST':
	tmpl = env.get_template('index.html')
	return tmpl.render()
	'''
	src = str(request.form['src'])
	dst = str(request.form['dst'])
	output = "Length of src was: " + str(len(src)) + " and recieved data was: " + src + "\n" + 	"Length of dst was: " + str(len(dst)) + " and recieved data was: " + dst
	'''

	#return output
		#return "Argument recieved"
 
if __name__ == "__main__":
    app.run()