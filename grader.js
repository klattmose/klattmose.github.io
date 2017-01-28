function grade(grid, solved, toSolve, score, steps){
	var pos = [];
	var solvable = [];
	
	if(!toSolve){
		var quantify = 10*score;
		return qualify(quantify);
	}
	if(steps > 150) return "Stuck in loop";
	
	for(var i = 0; i < 9; i++){
		var r = [];
		for(var j = 0; j < 9; j++){
			var q = [];
			getPos(grid,i,j,q);
			r.push(q);
		} // End for j
		pos.push(r);
	} // End for i
	
	score -= analyzeSingles(solvable,pos);
	
	if(!solvable.length) score += weHaveToGoDeeper(solvable,pos);
	if(!solvable.length) return qualify(10*score + 30*toSolve);
	
	for(var i = 0; i < solvable.length; i++){
		if(grid[ solvable[i][0] ][ solvable[i][1] ]) continue;
		
		grid[ solvable[i][0] ][ solvable[i][1] ] = solvable[i][2];
		score++;
		solved++;
		toSolve--;
	} // End for solvable
	return( grade(grid,solved,toSolve,score,steps+1) );
} // End function

function analyzeSingles(solvable, pos){
	var easySpots = 0;
	for(var i = 0; i < 9; i++){
		for(var j = 0; j < 9; j++){
			if(!pos[i][j].length) continue;
			
			if(pos[i][j].length == 1){
				solvable.push([i,j, pos[i][j][0] ]);
				continue;
			} // End if pos[i][j].length
			
			var hBox = unHideSingBox(i,j,pos);
			var hRC = unHideSingRowCol(i,j,pos);
			if(hBox){
				easySpots++;
				solvable.push([i,j,hBox]);
			} else if(hRC){
				solvable.push([i,j,hRC]);
			}
		} // End for j
	} // End for i
	return easySpots;
} // End function

function weHaveToGoDeeper(solvable, pos){
	var found = 0;
	var boxPosib = [];
	var rowPosib = [];
	var colPosib = [];
	var timeWarp = true;
	var loopCount = 5;
	
	for(var i = 0; i < 9; i++){
		var x = [];
		var y = [];
		var z = [];
		for(var j = 0; j < 9; j++){
			if(pos[i][j].length) x.push(pos[i][j]);
			if(pos[j][i].length) y.push(pos[j][i]);
			if(pos[ Math.floor(i/3)*3+Math.floor(j/3) ][ (i%3)*3+(j%3) ].length)
				z.push( pos[ Math.floor(i/3)*3+Math.floor(j/3)][ (i%3)*3+(j%3) ] );
			
		} // End for j
		boxPosib.push(z);
		rowPosib.push(x);
		colPosib.push(y);
	} // End for i
	
	while(timeWarp && loopCount--){
		timeWarp = false;
		var change = 0;
		for(var i = 0; i < 9; i++){
			change += findNakedPairs( rowPosib[i] )
				  +  findNakedPairs( colPosib[i] )
				  +  findNakedPairs( boxPosib[i] )
				  +  findNakedTriples( rowPosib[i] )
				  +  findNakedTriples( colPosib[i] )
				  +  findNakedTriples( boxPosib[i] );
		} // End for i
		found += change;
		if(change) timeWarp = true;
		analyzeSingles(solvable,pos);
		
		if(!solvable.length){
			change = 0
			for(var i = 0; i < 9; i++){
				change += findHiddenPairsTriples( rowPosib[i] )
					  +  findHiddenPairsTriples( colPosib[i] )
					  +  findHiddenPairsTriples( boxPosib[i] );
			}
			if(change) timeWarp = true;
			found += change;
			analyzeSingles(solvable,pos);
		}
	} // End while timeWarp
	
	return found;
} // End function

function gradePlay(){
	document.getElementById("message").innerHTML = "";
	var g = [];
	var openSpaces = 81;
	for(var i = 0; i < 9; i++){
		var r = [];
		for(var j = 0; j < 9; j++){
			var e = document.getElementById("c"+i+j);
			if(e.value){
				openSpaces--;
				r.push(e.value);
			} else r.push(0);
		} // End for j
		g.push(r);
	} // End for i
	
	return grade(g,0,openSpaces,0,0);
} // End function

function getPos(grid, x, y, pos){
	var values = [0,1,2,3,4,5,6,7,8,9];
	if(grid[x][y]) return;
	
	for(var num = 1; num <= 9; num++){
		for(var i = 0; i < 9; i++){
			if(grid[x][i] == num){
				values[num] = 0;
				break;
			}
			if(grid[i][y] == num){
				values[num] = 0;
				break;
			}
		} // End for i
		
		for(var i = x-x%3; i < 3+x-x%3; i++){
			for(var j = y-y%3; j < 3+y-y%3; j++){
				if(grid[i][j] == num){
					values[num] = 0;
					break;
				}
			} // End for j
		} // End for i
		
		if(values[num]) pos.push(num);
	} // End for num
} // End function

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}

function unHideSingBox(x, y, pos){
	for(var num = 1; num <= 9; num++){
		if(!pos[x][y].contains(num)) continue;
		var only = true;
		
		for(var i = x-x%3; i < 3+x-x%3; i++){
			for(var j = y-y%3; j < 3+y-y%3; j++){
				if( (i==x) && (j==y) ) continue;
				if(pos[i][j].contains(num)){
					only = false; 
					break; 
				} // End if pos.contains
			} // End for j
		} // End for i
		
		if(only) return num;
	} // End for num
	return false;
} // End function

function unHideSingRowCol(x, y, pos){
	for(var num = 1; num <= 9; num++){
		if(!pos[x][y].contains(num)) continue;
		var only = true;
		for(var i = 0; i < 9; i++){
			if(i == y) continue;
			if(pos[x][i].contains(num)) only = false;
		} // End for i
		if(only) return num;
		
		only = true;
		for(var i = 0; i < 9; i++){
			if(i == x) continue;
			if(pos[i][y].contains(num)) only = false;
		} // End for i
		if(only) return num;
	} // End for num
	return false;
	
} // End function

function qualify(score){
	var rating = 'Very Easy';
	if(score > 1400) rating = 'Extreme';
	else if(score > 1200) rating = 'Very Tough';
	else if(score > 900) rating = 'Tough';
	else if(score > 350) rating = 'Medium';
	else if(score > 150) rating = 'Easy';
	
	return rating;
} // End function

function findNakedPairs(x){
	if(x.length < 3) return 0;
	
	var keys = [];
	var counter = 0;
	
	for(var it in x)
		if(x[it].length == 2) keys.push(it);
	
	var len = keys.length;
	// go over all the possibilities of nCr 
	for( var i=0; i < len; i++ )
	for( var j= i+1; j < len; j++ ){
			
		if( x[ keys[i] ].length == 2 && x[ keys[i] ].join("") == x[ keys[j] ].join("") ){
			var numbers = x[ keys[i] ].join("");
			// iterate on all cells that are not in this filtered and remove the numbers found in the filtered
			for(var key in x){
				if( key != keys[i] && key != keys[j] ){ // skip cells which own the pairs found
					// iterate on numbers for each cell
					for( var idx=x[key].length; idx--; ){
						if( numbers.indexOf( x[key][idx] ) != -1 ){
							counter++;	// only increment the 'counter' when numbers were removed from other cells
							x[key].splice(idx, 1);
						}
					}
				}
			}
		}
	} // End double-for
	return counter;
}

function findNakedTriples(x){
	if(x.length < 4) return 0;
	
	var keys = [];
	var counter = 0;
	
	for(var it in x)
		if(x[it].length == 2) keys.push(it);
	
	var triple = []
	var len = keys.length; // cache thelength
	
	for( var i=0; i < len; i++ )
	for( var j= i+1; j < len; j++ )
	for( var k= j+1; k < len; k++ ){
		triple.push( keys[i], keys[j], keys[k] );
		
		// put all the triple's different numbers in string
		var numbers = '';
		for( var key=triple.length; key--; ){
			for( var idx=x[ triple[key] ].length; idx--; ){
				var num = x[ triple[key] ][idx];
				if( numbers.indexOf(num) == -1 )
					numbers += num;
			}
		}
		
		// if this is a valid truple
		if( numbers.length == 3 ){
			// iterate on all cells that are not in this triple and remove the numbers found in the triple
			for(var key in x){
				if( triple.indexOf(key) == -1 ){
					// iterate on numbers for each cell
					for( var idx=x[key].length; idx--; ){
						if( numbers.indexOf( x[key][idx] ) != -1 ){
							counter++; // only increment the 'counter' when numbers were removed from other cells
							x[key].splice(idx, 1);
						}
					}
				}
			}
		}
		triple.length = 0;
	} // End triple-for

	return counter;
} // End function

function findHiddenPairsTriples(x){
	if(x.length < 6) return 0;
	
	var bucket = "";
	var share = [];
	var counter = 0;
	
	for(var i = 0; i < x.length; i++){
		for(var j = 0; j < x[i].length; j++){
			bucket += x[i][j];
		}
	}
	
	for(var i = 0; i < x.length; i++){
		for(var j = i+1; j < x.length; j++){
			// find hidden Pairs
			share.length = 0;
			for(var n = 0; n < x[i].length; n++){
				var num = x[i][n];
				if( x[i].length + x[j].length > 4 )
					if( bucket.split(num).length == 3 && x[j].indexOf(num) != -1 )
						share.push(num);
						
				if( share.length == 2 ){
					counter++;
					// Change the possibilities
					for(var it = x[i].length-1; it--;){
						if( !share.contains(x[i][it]) ){
							x[i].splice(it,1);
						}
					}
					for(var it = x[j].length-1; it--;){
						if( !share.contains(x[j][it]) ){
							x[j].splice(it,1);
						}
					}
					break;
				}
			} // End for n
			
			// go 1 level deeper to find hidden Triples
			for(var k = j+1; k < x.length; k++){
				share.length = 0;
				for(var n = 0; n < x[i].length; n++){
					var num = x[i][n];
					if( x[i].length + x[j].length + x[k].length > 9 )
						if( bucket.split(num).length == 4 && x[j].indexOf(num) != -1 && x[k].indexOf(num) != -1 )
							share.push(num);
					
					if( share.length == 3 ){
						counter++;
						// Change the possibilities
						for(var it = x[i].length-1; it--;){
							if( !share.contains(x[i][it]) ){
								x[i].splice(it,1);
							}
						}
						for(var it = x[j].length-1; it--;){
							if( !share.contains(x[j][it]) ){
								x[j].splice(it,1);
							}
						}
						for(var it = x[k].length-1; it--;){
							if( !share.contains(x[k][it]) ){
								x[k].splice(it,1);
							}
						}
						break;
					}
				} // End for n
			} // End for k
		} // End for j
	} // End for i
	
	return counter;
}