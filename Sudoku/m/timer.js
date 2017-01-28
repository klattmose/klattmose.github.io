var playTime = 0;
var playing = false;
var Kronos;

function startTimer(){
	playTime = 0;
	stopTime();
	Kronos = setInterval(function(){incTimer()},1000);
} // End function

function incTimer(){
	playTime++;
} // End function

function showTime(input){
	var seconds = input%60;
	var minutes = Math.floor(input/60)%60;
	var hours = Math.floor(input/3600)%24;
	var days = Math.floor(input/86400);
	
	if(seconds < 10) seconds = "0" + seconds;
	if( minutes<10 && input>3600 ) minutes = "0" + minutes;
	if( hours<10 && input>86400 ) hours = "0" + hours;
	
	
	var stamp = minutes + ":" + seconds;
	if(days) stamp = days + "d  " + hours + ":" + stamp;
	else if(hours) stamp = hours + ":" + stamp;
	
	return stamp;
} // End function

function stopTime(){
	clearInterval(Kronos);
} // End function