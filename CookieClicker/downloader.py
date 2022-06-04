from urllib.request import Request, urlopen
import os
from xml.dom.minidom import parse
import xml.dom.minidom
from html.parser import HTMLParser

def downloadFile(url, filename):
	try:
		print(url)
		request = Request(url)
		request.add_header('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36')
		data = urlopen(request).read()
		# print(filename)
		# print(data)
		open(filename, 'wb').write(data)

	except:
		print("HTTP error")
#

def createFolder(path):
	try:
		os.mkdir(path)
	except OSError:
		print("Directory already exists")
#

def parseIndex(fname, dir, baseURL):
	with open(fname) as fp:
		line = fp.readline()
		cnt = 1
		while line:
			if cnt > 8:
				pos = line.find("a href=\"") + 8
				if pos > 8:
					href = line[pos : line.find("\"", pos)]
					downloadFile(baseURL + dir + "/" + href, os.path.realpath("Download/" + dir + "/" + href))
			line = fp.readline()
			cnt += 1
#

createFolder("Download")
DOMTree = xml.dom.minidom.parse("config.xml")

config = DOMTree.documentElement
baseURL = config.getAttribute("directory")

files = config.getElementsByTagName("file")
for file in files:
	fname = file.childNodes[0].data
	downloadFile(baseURL + fname, os.path.realpath("./Download/" + '/' + fname))
#

directories = config.getElementsByTagName("directory")
for directory in directories:
	dir = directory.childNodes[0].data
	createFolder(os.path.realpath("Download" + '/'+ dir))
	downloadFile(baseURL + dir, os.path.realpath("./Download/" + dir + "/index.html"))
	# print(baseURL + dir)
	# print(os.path.realpath("./Download/" + dir + "/index.html"))
	parseIndex(os.path.realpath("./Download/" + dir + "/index.html"), dir, baseURL)
#
