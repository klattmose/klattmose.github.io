/*
This is the code that makes the grid.

*/

function make(diff){
	//blankSlate();
	var g = [];
	var o = [];
	for(var i = 0; i < 9; i++) o.push([1,1,1,1,1,1,1,1,1]);
	
	// first row
	var p = [1,2,3,4,5,6,7,8,9];
	var a = [];
	for(var i = 0; i < 9; i++){
		var rand = Math.floor(Math.random() * p.length);
		a[i] = p[rand];
		p.splice(rand,1);
	} // End for i
	g.push(a);
	
	// first box
	var b = []
	var c = []
	p = [a[3],a[4],a[5],a[6],a[7],a[8]];
	for(var i = 0; i < 3; i++){
		var rand = Math.floor(Math.random() * p.length);
		b[i] = p[rand];
		p.splice(rand,1);
		rand = Math.floor(Math.random() * p.length);
		c[i] = p[rand];
		p.splice(rand,1);
	} // End for i
	
	for(var i = 3; i < 9; i++){
		b[i] = 0;
		c[i] = 0;
	} // End for i
	g.push(b);
	g.push(c);
	
	for(var i = 3; i < 9; i++){
		var r = [];
		for(var j = 0; j < 9; j++){
			r.push(0);
		} // End for j
		g.push(r);
	} // End for i
	
	solve_sudoku(g);
	switcheroo(g);
	dig(g,diff);
	
	var openSpaces = 0;
	for(var i = 0; i < 9; i++)
	for(var j = 0; j < 9; j++)
		if(!g[i][j]) openSpaces++;
	
	var stringy = JSON.stringify(g);
	var madeGrade = grade(g,0,openSpaces,0,0);
	g = JSON.parse(stringy);
	
	if(madeGrade == diff){
		console.log(stringy);
		//if(!numMade[diff]) setTimeout(function(i){make(diff)}, 100);
		//upload(g,diff);
		document.getElementById("message").innerHTML = "";
		
		return g;
	}
	else{
		console.log("Iteration    " + madeGrade);
		//setTimeout(function(i){make(diff)}, 10);
		return make(diff)
	} // End if score
	
} // End function

function switcheroo(grid){
	// switch indiv columns
	for(var i = 0; i < 3; i++){
		for(var k = 0; k < 3; k++){
			if(Math.floor(Math.random() * 2)){
				for(var j = 0; j < 9; j++){
					var temp = grid[i*3 + k][j];
					grid[i*3 + k][j] = grid[i*3 + (k+1)%3][j];
					grid[i*3 + (k+1)%3][j] = temp;
				} // End for j
			} // End if rand
		} // End for k
	} // End for i
	
	// switch indiv rows
	for(var i = 0; i < 3; i++){
		for(var k = 0; k < 3; k++){
			if(Math.floor(Math.random() * 2)){
				for(var j = 0; j < 9; j++){
					var temp = grid[j][i*3 + k];
					grid[j][i*3 + k] = grid[j][i*3 + (k+1)%3];
					grid[j][i*3 + (k+1)%3] = temp;
				} // End for j
			} // End if rand
		} // End for k
	} // End for i
	
	// switch ribbon columns
	for(var k = 0; k < 3; k++){
		if(Math.floor(Math.random() * 2)){
			for(var j = 0; j < 9; j++){
				for(var i = 0; i < 3; i++){
					var temp = grid[k*3 + i][j];
					grid[k*3 + i][j] = grid[((k+1)*3)%3 + i][j];
					grid[((k+1)*3)%3 + i][j] = temp;
				} // End for i
			} // End for j
		} // End if rand
	} // End for k
	
	// switch ribbon rows
	for(var k = 0; k < 3; k++){
		if(Math.floor(Math.random() * 2)){
			for(var j = 0; j < 9; j++){
				for(var i = 0; i < 3; i++){
					var temp = grid[j][k*3 + i];
					grid[j][k*3 + i] = grid[j][((k+1)*3)%3 + i];
					grid[j][((k+1)*3)%3 + i] = temp;
				} // End for i
			} // End for j
		} // End if rand
	} // End for k
	
} // End function

function blankSlate(){
	for(var i = 0; i < 9; i++){
		for(var j = 0; j < 9; j++){
			var e = document.getElementById("c" + i + j);
			$(e).removeClass("d");
			$(e).removeClass("sel");
			$(e).removeClass("wrong");
			$(e).removeClass("win");
			$(e).removeClass("hi");
			
			e.value = "";
		} // End for j
		document.getElementById((i+1) + "count").value = 0;
		$("#" + (i+1) + "count").removeClass("all");
		$("#" + (i+1) + "sel").removeClass("all");
		$("#" + (i+1) + "sel").removeClass("hi");
	} // End for i
	document.getElementById("0count").value = 0;
	stopTime();
	playTime = 0;
	document.getElementById("timeline").innerHTML = "";
}

function reset(){
	playTime = 0;
	for(var i = 0; i < 9; i++){
		for(var j = 0; j < 9; j++){
			var e = document.getElementById("c" + i + j);
			$(e).removeClass("sel");
			$(e).removeClass("wrong");
			$(e).removeClass("win");
			$(e).removeClass("hi");
			
			if(e.value){
				var f = document.getElementById(e.value + "count");
				f.value = parseInt(f.value) - 1;
				e.value = "";
			} // End if value
		} // End for j
		$("#" + (i+1) + "count").removeClass("all");
		$("#" + (i+1) + "sel").removeClass("all");
		$("#" + (i+1) + "sel").removeClass("hi");
	} // End for i
}

function dig(grid,diff){
	var a = 0;
	var symm = 1;
	var loopCount = 0;
	var maxLoop = 100;
	var space;
	
	switch(diff){
		case "Very Easy":
			space = 40;
			maxLoop = 75;
			symm = 2;
			break;
		case "Easy":
			space = 48;
			maxLoop = 85;
			break;
		case "Medium":
			space = 50;
			maxLoop = 95;
			break;
		case "Tough":
			space = 55;
			maxLoop = 105;
			break;
		case "Very Tough":
			space = 60;
			maxLoop = 110;
			symm = 0;
			break;
		case "Extreme":
			space = 60;
			maxLoop = 115;
			symm = 0;
			break;
	} // End switch
	
	while(a < space && loopCount++ < maxLoop){
		var x = Math.floor(Math.random() * 9);
		var y = Math.floor(Math.random() * 9);
		if(!grid[x][y]) continue;
		
		var temp1 = grid[x][y];
		if(symm){
			var temp2 = grid[8-x][8-y];
			if(symm > 1){
				var temp3 = grid[x][8-y];
				var temp4 = grid[8-x][y];
			}
		}
		
		grid[x][y] = 0;
		if(symm){
			grid[8-x][8-y] = 0;
			a++;
			if(symm > 1){
				grid[x][8-y] = 0;
				grid[8-x][y] = 0;
				if(x != 8-x) a++;
				if(y != 8-y) a++;
			}
		}
		a++;
		
		if(numSolutions(grid) == 1) continue;
		
		grid[x][y] = temp1;
		if(symm){
			grid[8-x][8-y] = temp2;
			a--;
			if(symm > 1){
				grid[x][8-y] = temp3;
				grid[8-x][y] = temp4;
				if(x != 8-x) a--;
				if(y != 8-y) a--;
			}
		}
		a--;
	} // End while
} // End function

function upload(grid,diff){
	var stringy = JSON.stringify(grid);
	
	$.ajax({
		type: "POST",
		url: "uploadGrid.php",
		data: "grid=" + stringy + "&diff=" + diff + "&num=" + numMade[diff]
	});
	numMade[diff]++;
} // End function