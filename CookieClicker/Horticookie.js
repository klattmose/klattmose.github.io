Game.Win('Third-party');
if(Horticookie === undefined) var Horticookie = {};


Horticookie.init = function(){
	Horticookie.isLoaded = 1;
	Horticookie.Backup = {};
	Horticookie.M = Game.Objects["Farm"].minigame;
	
	Horticookie.initCodes();
	Horticookie.buildMutationMap();
	Horticookie.setPercentagePrecision(4);
	
    var gpl = Horticookie.M.plotLimits[Horticookie.M.plotLimits.length - 1];
    Horticookie.maxPlotWidth = gpl[2] - gpl[0];
    Horticookie.maxPlotHeight = gpl[3] - gpl[1];
	Horticookie.nextTickProbabilities = [];
	Horticookie.nextTickProbabilities.length = Horticookie.maxPlotHeight;
    for(var y = 0; y < Horticookie.maxPlotHeight; ++y) {
        var tmp = [];
        tmp.length = Horticookie.maxPlotWidth;
        for(var x = 0; x < tmp.length; ++x) {
            tmp[x] = { empty: 1, immature: [], mature: [] };
        }
        Horticookie.nextTickProbabilities[y] = tmp;
    }
	
	
	
	Horticookie.Backup.scriptLoaded = Game.scriptLoaded;
	Game.scriptLoaded = function(who, script) {
		Horticookie.Backup.scriptLoaded(who, script);
		Horticookie.ReplaceNativeGarden();
	}
	
	Horticookie.ReplaceNativeGarden();
	
	
	//***********************************
	//    Post-Load Hooks 
	//    To support other mods interfacing with this one
	//***********************************
	if(Horticookie.postloadHooks) {
		for(var i = 0; i < Horticookie.postloadHooks.length; ++i) {
			(Horticookie.postloadHooks[i])();
		}
	}
	
	if (Game.prefs.popups) Game.Popup('Horticookie loaded!');
	else Game.Notify('Horticookie loaded!', '', '', 1, 1);
}


//***********************************
//    Horticookie functions
//***********************************
Horticookie.initCodes = function(){
	Horticookie.recipeCodes = {};
	Horticookie.statusCodes = {};
	
	Horticookie.recipeCodes.NORMAL = 1;
	Horticookie.recipeCodes.WEED = 2;
	Horticookie.recipeCodes.CREATED_ON_KILL = 3;
	
	Horticookie.statusCodes.LOCKED = 0;
	Horticookie.statusCodes.UNLOCKABLE = 1;
	Horticookie.statusCodes.MAYGROWEVENTUALLY = 2;
	Horticookie.statusCodes.MAYGROW = 3;
	Horticookie.statusCodes.WEED = 4;
	Horticookie.statusCodes.PREMATURE_DANGER = 5;
	Horticookie.statusCodes.PREMATURE = 6;
	Horticookie.statusCodes.MATURE_DANGER = 7;
	Horticookie.statusCodes.MATURE = 8;
	Horticookie.statusCodes.UNLOCKED = 9;
}

Horticookie.formatPercentage = function(value) {
    if(!Horticookie.percentagePrecision) {
        return value * 100 + '%';
    } else {
        var sign = (value < 0 ? '-' : '');
        value = Math.abs(value);
        if(value < Horticookie.minPercentage) {
            if(sign) {
                return '-' + Horticookie.minPercentageStr + 'to 0%';
            } else {
                return '<' + Horticookie.minPercentageStr;
            }
        } else {
            // Decided on floor instead of round, it is more similar to the expectations
            value = Math.floor(value * 100 * Horticookie.percentagePow10);
            var low = value % Horticookie.percentagePow10;
            var low_digits = Horticookie.percentagePrecision;
            while(low > 0 && low % 10 === 0) {
                low /= 10;
                low_digits -= 1;
            }
            if(low) {
                low = '' + low;
                while(low.length < low_digits) {
                    low = '0' + low;
                }
                low = '.' + low;
            } else {
                low = '';
            }
            var high = Math.floor(value / Horticookie.percentagePow10);
            return sign + high + low + '%';
        }
    }
}

Horticookie.setPercentagePrecision = function(precision) {
    if(precision < 0) {
        throw "In setPercentagePrecision: precision must be >= 0, got " + precision;
    } else {
        Horticookie.percentagePrecision = precision;
        if(!precision) {
            Horticookie.minPercentage = null;
            Horticookie.minPercentageStr = null;
            Horticookie.percentagePow10 = null;
       } else {
            Horticookie.minPercentage = Math.pow(10, -precision - 2);
            Horticookie.minPercentageStr = '' + Math.pow(10, -precision) + '%';
            Horticookie.percentagePow10 = Math.pow(10, precision);
       }       
    }
}

Horticookie.buildMutationMap = function(){
	var M = Horticookie.M;
	var getMuts = M.getMuts.toString();
	Horticookie.mutationsMap = [];
	
	//***********************************
	//    Some functions that I want to put here instead of elsewhere
	//***********************************
	function newMut(source){return {source:source, type:Horticookie.recipeCodes.NORMAL, neighs:[], neighsM:[], product:[]};}
	function parsePredecessors(mut){
		var pres = mut.source.replace(/neighs/g, "").split(" && ");
		for(var i = 0; i < pres.length; i++){
			var mature = pres[i].substring(0, 1) == "M";
			var gt = pres[i].indexOf(">") >= 0;
			var gte = pres[i].indexOf(">=") >= 0;
			var lt = pres[i].indexOf("<") >= 0;
			var lte = pres[i].indexOf("<=") >= 0;
			
			var isMax = false;
			var digit = eval(pres[i].substring(pres[i].length - 1, pres[i].length));
			
			if(gte)     {isMax = false;}
			else if(gt) {isMax = false; digit++;}
			else if(lte){isMax = true; digit++;}
			else if(lt) {isMax = true;}
			
			var plant = eval(pres[i].substring(pres[i].indexOf("[") + 1, pres[i].indexOf("]")));
			
			if(mature) mut.neighsM.push({plant:plant, isMax:isMax, count:digit});
			else mut.neighs.push({plant:plant, isMax:isMax, count:digit});
		}
	}
	
	getMuts = getMuts.replace(/\t/g,'');
	var arr = getMuts.split("\n");
	
	for(var i = 0; i < arr.length; i++){
		var line = arr[i];
		
		if(line.substring(0, 4) == 'if ('){
			var lineMuts = [];
			var pos = 0;
			
			do{
				pos = line.indexOf('(neigh', pos) + 1;
				var temp = line.substring(pos, line.indexOf(')', pos));
				lineMuts.push(newMut(temp));
				
				parsePredecessors(lineMuts[lineMuts.length - 1]);
				
				pos = line.indexOf('||', pos);
			}while(pos > 0)
			
			pos = line.indexOf('muts.push(') + 'muts.push(['.length;
			var product = line.substring(pos, line.indexOf(')', pos) - 1).split('],[');
			
			for(var j = 0; j < lineMuts.length; j++){
				for(var k = 0; k < product.length; k++){
					var mut = newMut();
					mut.neighs = lineMuts[j].neighs;
					mut.neighsM = lineMuts[j].neighsM;
					mut.product = product[k].split(',');
					
					mut.product[0] = eval(mut.product[0]);
					mut.product[1] = eval(mut.product[1]);
					delete mut.source;
					
					Horticookie.mutationsMap.push(mut);
				}
			} 
		}
	}
}

Horticookie.getRecipes = function(plant){
	var recipes = [];
	
	for(var i = 0; i < Horticookie.mutationsMap.length; i++){
		var recipe = Horticookie.mutationsMap[i];
		if(recipe.product[0] == plant.key) recipes.push(recipe);
	}
	
	return recipes;
}

Horticookie.toHTML = function(recipe){
	var M = Horticookie.M;
	var res = '';
	var limiters = [];
	
	for(var i = 0; i < recipe.neighsM.length; i++){
		if(recipe.neighsM[i].isMax){ 
			limiters.push(recipe.neighsM[i]);
			limiters[limiters.length - 1].isM = true;
		}
		else{
			res += (res.length == 0 ? '' : ' + ') + '<b>' + recipe.neighsM[i].count + '</b> × <b>' + M.plants[recipe.neighsM[i].plant].name + '</b> (M)';
		}
	}
	for(var i = 0; i < recipe.neighs.length; i++){
		if(recipe.neighs[i].isMax){
			limiters.push(recipe.neighs[i]);
			limiters[limiters.length - 1].isM = false;
		}
		else{
			res += (res.length == 0 ? '' : ' + ') + '<b>' + recipe.neighs[i].count + '</b> × <b>' + M.plants[recipe.neighs[i].plant].name + '</b> (AA)';
		}
	}
	for(var i = 0; i < limiters.length; i++){
		res += (i == 0 ? ' if ' : ', ');
		if(limiters[i].count == 1){
			res += 'no <b>' + M.plants[limiters[i].plant].name + '</b> ' + (limiters[i].isM ? '(M)' : '(AA)');
		}else{
			res += '<b>' + M.plants[limiters[i].plant].name + '</b> ' + (limiters[i].isM ? '(M)' : '(AA)') + ' &lt; <b>' + limiters[i].count + '</b>';
		}
	}
	
	res += ' = <b>' + Horticookie.formatPercentage(recipe.product[1]) + '</b>';
	
	return res;
}

Horticookie.recalcTileStatus = function(){
	//***********************************
	//    Get current status
	//***********************************
	for(var y = 0; y < Horticookie.maxPlotHeight; y++){
        for(var x = 0; x < Horticookie.maxPlotWidth; ++x) {
            Horticookie.nextTickProbabilities[y][x] = {}
        }
	}
	
	
}




//***********************************
//    Functions that override the garden
//***********************************
Horticookie.computeEffs = function(){
	Horticookie.Backup.computeEffs();
	Horticookie.recalcTileStatus();
}

Horticookie.seedTooltip = function(id){
	var M = Horticookie.M;
	var old_fn = Horticookie.Backup.seedTooltip(id);
	return function(){
        var tt = old_fn();
		if(id < 0 || id >= M.plantsById.length) {
            return tt;
        } else {
            var plant = M.plantsById[id];
			var recipes = Horticookie.getRecipes(plant);
			var rhtml = '';
			
			for(var k = 0; k < recipes.length; ++k) {
                var hh = Horticookie.toHTML(recipes[k]);
                /*if(!ps.recipesUnlocked[k]) {
                    hh = '<s>' + hh + '</s>';
                }*/
                rhtml += '<div style="white-space: nowrap; margin-top: 0.5em;">' + hh + '</div>';
            }
			
			if(rhtml) {
                return tt.replace(/<\/div>$/, '<div class="line"></div>' + rhtml +
                                  '<div style="margin-top: 0.5em; text-align: center;">' +
                                  '<small>(M) = mature, (AA) = any age, OO = other outcomes</small></div></div>');
            } else {
                return tt;
            }
		}
	}
}


//***********************************
//    Inject into the garden minigame
//***********************************
Horticookie.ReplaceNativeGarden = function() {
	Horticookie.HasReplaceAgronomicon = false;
	if (!Horticookie.HasReplaceNativeGardenLaunch && Game.Objects["Farm"].minigameLoaded) {
		var M = Game.Objects["Farm"].minigame;
		
		Horticookie.Backup.computeEffs = M.computeEffs;
		Horticookie.Backup.seedTooltip = M.seedTooltip;
		
		M.computeEffs = Horticookie.computeEffs;
		M.seedTooltip = Horticookie.seedTooltip;
		
		
		Horticookie.HasReplaceNativeGardenLaunch = true;
	}
}



if(!Horticookie.isLoaded) Horticookie.init();