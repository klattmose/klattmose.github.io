function l(what) {return document.getElementById(what);}

var leadingZero = function(s){
	return (s < 10 ? "0" : "") + s;
}

var UpdateTime = function(){
	var d = new Date();
	var h = d.getHours();
	var m = d.getMinutes();
	var s = d.getSeconds();
	var ampm = h > 11 ? "PM" : "AM";
	
	if(h > 11) h -= 12;
	if(h == 0) h = 12;
	
	var t = leadingZero(h) + ":" + leadingZero(m);
	
	l("title").innerHTML = t;
	l("ampm").innerHTML = ampm;
	l("sec").innerHTML = leadingZero(s);
	l("hhmm").innerHTML = t;
	
	requestAnimationFrame(UpdateTime);
}

requestAnimationFrame(UpdateTime);