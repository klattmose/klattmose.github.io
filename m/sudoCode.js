

var selectedBox = "";
var highlighter = false;
var highlightable = false;
var currDiff = "";
var name = "anonymous";
var fileRoot = "http://www-personal.engin.umd.umich.edu/~mklose/Sudoku/";
var countNums = [0,0,0,0,0,0,0,0,0];

var numUsed = {
			"Very Easy" : 0,
			Easy : 0,
			Medium : 0,
			Tough : 0,
			"Very Tough" : 0,
			Extreme : 0
}

var numMax = {
			"Very Easy" : 0,
			Easy : 4000,
			Medium : 1636,
			Tough : 560,
			"Very Tough" : 449,
			Extreme : 245
}

function by(property,dir) {
	return function (a,b) {
		var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
		return result * dir;
	}
}

function togHi(){
	highlightable = !highlightable;
	for(var i = 0; i < 9; i++){
		for(var j = 0; j < 9; j++){
			var e = $("#c" + i + j);
			e.removeClass("hi");
		} // End for j
		$("#" + (i+1) + "sel").removeClass("hi");
	} // End for i
} // End function

function sizeMe(){
	var c = $('.c').first();
	
	var width = $(c).width(),
		orig = $(c).html(),
		html = '<span style="white-space:nowrap"></span>',
		line = $(c).wrapInner(html).children()[0],
		n = 100;

	$(c).css('font-size', n);

	while($(line).height() < width) $(c).css('font-size', ++n);
	while($(line).height() > width) $(c).css('font-size', --n);
	
	$(c).html(orig);
	
	$('.c').each( function (i, c){ $(c).css('font-size', n); } );
	$(".spacer").css('font-size', n/4);
	
	var i = $('.i').first();
	
	var width = $(i).width(),
		orig = $(i).html(),
		html = '<span style="white-space:nowrap"></span>',
		line = $(i).wrapInner(html).children()[0],
		n = 100;

	$(i).css('font-size', n);

	while($(line).height() < width) $(i).css('font-size', ++n);
	while($(line).height() > width) $(i).css('font-size', --n);
	
	$(i).html(orig);
	
	$('.i').each( function (i, i){ $(i).css('font-size', n); } );
}

function blankSlate(){
	for(var i = 0; i < 9; i++){
		for(var j = 0; j < 9; j++){
			var e = $("#c" + i + j);
			e.removeClass("d");
			e.removeClass("sel");
			e.removeClass("wrong");
			e.removeClass("win");
			e.removeClass("hi");
			
			e.html("&nbsp");
		} // End for j
		countNums[i] = 0;
		$("#" + (i+1) + "sel").removeClass("all");
		$("#" + (i+1) + "sel").removeClass("hi");
	} // End for i
	stopTime();
	playTime = 0;
	$.mobile.changePage($("#home"));
}

function reset(){
	playTime = 0;
	for(var i = 0; i < 9; i++){
		for(var j = 0; j < 9; j++){
			var e = $("#c" + i + j);
			e.removeClass("sel");
			e.removeClass("wrong");
			e.removeClass("win");
			e.removeClass("hi");
			
			if(e.html() != "&nbsp;"){
				var f = e.html();
				countNums[f - 1]--;
				e.html("&nbsp");
			} // End if value
		} // End for j
		$("#" + (i+1) + "sel").removeClass("all");
		$("#" + (i+1) + "sel").removeClass("hi");
	} // End for i
}

function solve(){
	var g = [];
	for(var i = 0; i < 9; i++){
		var r = [];
		for(var j = 0; j < 9; j++){
			var f = $("#c"+i+j);
			var val = f.html();
			console.log(val);
			if(val == "&nbsp;") val = 0;
			r.push(parseInt(val));
		} // End for j
		g.push(r);
	} // End for i
	
	var r = solve_sudoku(g);
	
	for(var i = 0; i < 9; i++){
		for(var j = 0; j < 9; j++){
			var f = $("#c"+i+j);
			f.html(g[i][j]);
		} // End for j
		/*$("#" + (i+1) + "count").addClass("all");
		$("#" + (i+1) + "sel").addClass("all");
		document.getElementById((i+1) + "count").value = 9;*/
	} // End for i
	/*document.getElementById("0count").value = 0;*/
	console.log(g);
	win(0);
}

function win(legit){
	stopTime();
	for(var i = 0; i < 9; i++){
		for(var j = 0; j < 9; j++){
			$("#c" + i + j).addClass("win");
		} // End for j
	} // End for i
	
	var filePath = fileRoot + currDiff + "/leaderboard.json";
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET",filePath,false);
	xmlhttp.send(null);
	var fileContent = xmlhttp.responseText;
	var lb = JSON.parse(fileContent);
	
	var displayStr = currDiff + ":\n";
	
	if(legit && playTime > 60){
		if(highlighter){
			filePath = fileRoot + currDiff + "/leaderboardHi.json";
			xmlhttp = new XMLHttpRequest();
			xmlhttp.open("GET",filePath,false);
			xmlhttp.send(null);
			fileContent = xmlhttp.responseText;
			lb = JSON.parse(fileContent);
			
			if(playTime < lb[4]["time"]){
				name = prompt("New high score!",name);
				if(name != "null"){
					lb[4]["name"] = name;
					lb[4]["time"] = playTime;
					lb.sort(by("time",1));
					upScore(lb,currDiff,true);
				} // End if name
			} // End if playTime
		}
		else{
			if(playTime < lb[4]["time"]){
				name = prompt("New high score!",name);
				if(name != "null"){
					lb[4]["name"] = name;
					lb[4]["time"] = playTime;
					lb.sort(by("time",1));
					upScore(lb,currDiff,false);
				} // End if name
			} // End if playTime
		} // End if highlighter
	} // End if legit
	
	for(var i = 0; i < 5; i++) displayStr += (i+1) + ". " + lb[i]["name"] + "       " + showTime(lb[i]["time"]) + "\n";
	alert(displayStr);
	
	$.mobile.changePage($("#home"));
} // End function

function checkNum(val){
	for(var i = 0; i < 9; i++){
		for(var j = 0; j < 9; j++){
			$("#c" + i + j).removeClass("wrong");
		} // End for j
	} // End for i
	
	var selId = selectedBox.id;
	var x = parseInt(selId.charAt(1));
	var y = parseInt(selId.charAt(2));
	
	for(var i = 0; i < 9; i++){
		var nx = $("#c" + x + i);
		var ny = $("#c" + i + y);
		if(nx.html() == val){
			nx.addClass("wrong");
			return 1;
		} else if(ny.html() == val){
			ny.addClass("wrong");
			return 1;
		} // End if
	} // End for i
	
	for(var i = x-x%3; i < 3+x-x%3; i++){
		for(var j = y-y%3; j < 3+y-y%3; j++){
			var nb = $("#c" + i + j);
			if(nb.html() == val){
				nb.addClass("wrong");
				return 1;
			} // End if
		} // End for j
	} // End for i
	
	return 0;
} // End function

function highlight(val){
	if(!highlightable) return;
	
	highlighter = true;
	for(var i = 0; i < 9; i++){
		for(var j = 0; j < 9; j++){
			e = $("#c" + i + j)
			if(e.html() != "&nbsp;"){
				e.addClass("hi");
				if(e.html() == val){
					high(i,j);
				} // End if value == val
			} // End if value
		} // End for j
		$("#" + (i+1) + "sel").removeClass("hi");
	} // End for i
	
	$("#" + val + "sel").addClass("hi");
} // End function

function high(x,y){
	for(var i = 0; i < 9; i++){
		$("#c" + x + i).addClass("hi");
		$("#c" + i + y).addClass("hi");
	} // End for i
	
	for(var i = x-x%3; i < 3+x-x%3; i++){
		for(var j = y-y%3; j < 3+y-y%3; j++){
			$("#c" + i + j).addClass("hi");
		} // End for j
	} // End for i
} // End function

function nohigh(){
	for(var i = 0; i < 9; i++){
		for(var j = 0; j < 9; j++){
			$("#c" + i + j).removeClass("hi");
		} // End for j
	} // End for i
} // End function

function selectC(tag){
	if(selectedBox)	$(selectedBox).removeClass("sel");
	selectedBox = tag;
	nohigh();
	
	for(var i = 0; i < 9; i++){
		for(var j = 0; j < 9; j++){
			$("#c" + i + j).removeClass("wrong");
		} // End for j
	} // End for i
	
	if($(selectedBox).hasClass("d")){
		selectedBox = "";
		for(var i = 1; i <= 9; i++){
			$("#" + i + "sel").removeClass("hi");
		} // End for i
		return;
	}
	$(selectedBox).addClass("sel");
} // End function

function selectN(num){
	nohigh();
	
	if(!num){
		if(selectedBox){
			if($(selectedBox).hasClass("d")) return;
			if( $(selectedBox).html() != "&nbsp;"){
				var val = parseInt($(selectedBox).html());
				countNums[val - 1]--;
				$("#" + i + "sel").removeClass("all");
				$(selectedBox).html("&nbsp");
			}
			$(selectedBox).removeClass("sel");
			selectedBox = "";
		} // End if selectedBox
		return;
	} // End if !num
	
	if(selectedBox){
		if(checkNum(num)) return;
		
		if($(selectedBox).hasClass("d")) return;
		if( $(selectedBox).html() != "&nbsp;"){
			var val = parseInt($(selectedBox).html());
			countNums[val - 1]--;
			$("#" + val + "sel").removeClass("all");
		}
		
		$(selectedBox).html(num);
		countNums[num - 1]++;
		for(var i = 1; i <= 9; i++){
			$("#" + i + "sel").removeClass("hi");
		} // End for i
		
		if(countNums[num-1] == 9){
			$("#" + num + "sel").addClass("all");
		} // End if newn.value
		
		$(selectedBox).removeClass("sel");
	}
	else{
		highlight(num);
	} // End if selectedBox
	selectedBox = "";
	
	for(var i = 0; i < 9; i++){
		if(countNums[i] != 9) return;
	} // End for i
	
	win(1);
} // End function

function upScore(lb,diff,hi){
	var stringy = JSON.stringify(lb);
	var ext = "";
	if(hi) ext = "Hi";
	
	$.ajax({
		type: "POST",
		url: fileRoot + "uploadLeaderboard.php",
		data: "&lb=" + stringy + "&diff=" + diff + "&hi=" + ext
	});
} // End function

function callMake(diff){
	blankSlate();
	highlighter = false;
	currDiff = diff;
	$.mobile.changePage($("#game"));
	
	numUsed[diff] = Math.floor(Math.random() * numMax[diff]);
	var filePath = fileRoot + diff + "/" + numUsed[diff] + ".json";
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET",filePath,false);
	xmlhttp.send(null);
	var fileContent = xmlhttp.responseText;
	
	var g = JSON.parse(fileContent);
	for(var i = 0; i < 9; i++){
		for(var j = 0; j < 9; j++){
			var f = $("#c" + i + j);
			f.removeClass("d");
			
			if(g[i][j]){
				f.html(g[i][j]);
				f.addClass("d");
				countNums[ g[i][j] -1 ]++;
			}
			else{
				f.html("&nbsp");
			} // End if g[i][j]
		} // End for j
	} // End for i
	setTimeout(function(){sizeMe();},1000);
	
	var sizeX = $(window).height()/10;
	styles = { 'height': sizeX };
	$('.ui-btn').css(styles);
	$('.ui-btn-text').css('font-size',sizeX * .75);
	
	startTimer();
} // End function

function goToOp(){
	$.mobile.changePage($("#options"));
	
	var sizeX = $(window).height()/10;
	styles = { 'height': sizeX };
	$('.ui-btn').css(styles);
	$('.ui-btn-text').css('font-size',sizeX * .75);
} // End function