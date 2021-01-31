if(Horticookie === undefined) var Horticookie = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (0 ? 'Beta/' : '') + 'CCSE.js');
Horticookie.name = 'Horticookie';
Horticookie.version = '3.15';
Horticookie.GameVersion = '2.031';

//***********************************
//    For testing
//***********************************
//Game.LoadMod('https://bitbucket.org/Acharvak/cookie-clicker-agronomicon/downloads/Agronomicon.js');

Horticookie.launch = function(){
	Horticookie.init = function(){
		Horticookie.isLoaded = 1;
		Horticookie.Backup = {};
		Horticookie.initCodes();
		Horticookie.setPercentagePrecision(4);
		Horticookie.plantStatus = {};
		Horticookie.unlockables = {};
		Horticookie.unlockableCount = 0;
		
		Horticookie.restoreDefaultConfig();
		if(CCSE.config.OtherMods.Horticookie && !Game.modSaveData[Horticookie.name]) Game.modSaveData[Horticookie.name] = JSON.stringify(CCSE.config.OtherMods.Horticookie);
		/*Horticookie.load();
		CCSE.customLoad.push(Horticookie.load);
		CCSE.customSave.push(Horticookie.save);*/
		
		
		Horticookie.ReplaceNativeGarden();
		Horticookie.ReplaceMainGame();
		
		Game.registerHook('draw', Horticookie.draw);
		
		
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

	Horticookie.initWithGarden = function(M){
		Horticookie.M = M;
		Horticookie.buildMutationMap();
		Horticookie.buildUpgradesMap();
		Horticookie.backupPlants();
		
		var gpl = M.plotLimits[M.plotLimits.length - 1];
		Horticookie.maxPlotWidth = gpl[2] - gpl[0];
		Horticookie.maxPlotHeight = gpl[3] - gpl[1];
		
		Horticookie.nextTickProbabilities = [];
		Horticookie.nextTickProbabilities.length = Horticookie.maxPlotHeight;
		for(var y = 0; y < Horticookie.maxPlotHeight; ++y) {
			var tmp = [];
			tmp.length = Horticookie.maxPlotWidth;
			for(var x = 0; x < tmp.length; ++x) {
				tmp[x] = {empty: 1, immature: {}, mature: {}};
			}
			Horticookie.nextTickProbabilities[y] = tmp;
		}
		
		for(var prefName in Horticookie.config) Horticookie.applyPref(prefName);
		
		Horticookie.recalcTileStatus();
		Horticookie.recalcPlantStatus();
		Horticookie.recalcUnlockables();
	}


	//***********************************
	//    Config functions
	//***********************************
	Horticookie.defaultConfig = function(){
		return {
			autoHarvest:0,
			allImmortal:0,
			accelGarden:0
		}
	}

	Horticookie.togglePref = function(prefName, button, on, off, invert){
		if (Horticookie.config[prefName]){
			l(button).innerHTML = off;
			Horticookie.config[prefName] = 0;
		}else{
			l(button).innerHTML = on;
			Horticookie.config[prefName] = 1;
		}
		
		if(Game.Objects['Farm'].minigameLoaded) Horticookie.applyPref(prefName);
		
		l(button).className = 'option' + ((Horticookie.config[prefName]^invert) ? '' : ' off');
	}

	Horticookie.applyPref = function(prefName){
		var M = Horticookie.M;
		switch(prefName){
			case 'allImmortal':
				for(var key in M.plants){
					if(Horticookie.Backup.plants[key].immortal){} // Do nothing
					else{
						if(Horticookie.config[prefName]){
							M.plants[key].immortal = 1;
							M.plants[key].detailsStr = (M.plants[key].detailsStr ? M.plants[key].detailsStr + ', i' : 'I') + 'mmortal';
						}
						else{
							M.plants[key].detailsStr = Horticookie.Backup.plants[key].detailsStr;
							delete M.plants[key].immortal;
						}
					}
				}
				Horticookie.computeEffs();
				break;
		}
	}

	Horticookie.save = function(){
		//CCSE.config.OtherMods.Horticookie = Horticookie.config;
		if(CCSE.config.OtherMods.Horticookie) delete CCSE.config.OtherMods.Horticookie; // no need to keep this, it's now junk data
		return JSON.stringify(Horticookie.config);
	}

	Horticookie.load = function(str){
		var config = JSON.parse(str);
//		if(CCSE.config.OtherMods.Horticookie){
			Horticookie.config.autoHarvest = config.autoHarvest;
			Horticookie.config.allImmortal = config.allImmortal;
			Horticookie.config.accelGarden = config.accelGarden;
//		}
		
		if(Game.Objects["Farm"].minigameLoaded) for(var prefName in Horticookie.config) Horticookie.applyPref(prefName);
	}

	Horticookie.restoreDefaultConfig = function(){
		Horticookie.config = Horticookie.defaultConfig();
	}


	//***********************************
	//    Horticookie functions
	//***********************************
	Horticookie.getMenuString = function(){
		var writeHeader = function(text) {
			var div = document.createElement('div');
			div.className = 'listing';
			div.style.padding = '5px 16px';
			div.style.opacity = '0.7';
			div.style.fontSize = '17px';
			div.style.fontFamily = '\"Kavoon\", Georgia, serif';
			div.textContent = text;
			return div.outerHTML;
		}
		
		var WriteButton = function(prefName, button, on, off, callback, invert){
			var invert = invert ? 1 : 0;
			if (!callback) callback = '';
			callback += 'PlaySound(\'snd/tick.mp3\');';
			return '<a class="option' + ((Horticookie.config[prefName]^invert) ? '' : ' off') + '" id="' + button + '" ' + Game.clickStr + '="Horticookie.togglePref(\'' + prefName + '\',\'' + button + '\',\'' + on.replace("'","\\'") + '\',\'' + off.replace("'","\\'") + '\',\'' + invert + '\');' + callback + '">' + (Horticookie.config[prefName] ? on : off) + '</a>';
		}
		
		
		var str = '';
			
		str += writeHeader("Helpers");
		str += '<div class="listing">' + WriteButton('autoHarvest', 'autoHarvestButton', 'Autoharvest ON', 'Autoharvest OFF', '') + '<label>Automatically harvests mature interesting plants.</label></div>';
		str += '<div class="listing">' + WriteButton('allImmortal', 'allImmortalButton', 'Immortalize ON', 'Immortalize OFF', '') + '<label>All plants are immortal.</label></div>';
		str += '<div class="listing">' + WriteButton('accelGarden', 'accelGardenButton', 'Accelerated Garden ON', 'Accelerated Garden OFF', '') + '<label>Alters the randomFloor function to always give the higher result. Practical effect is no plant will take longer than 100 ticks to mature.</label></div>';
		str += '<div class="listing"><small>A plant is considered Interesting if you lack its seed, if it\'s mature and you lack its upgrade, or if it\'s a Juicy Queenbeet. Danger is a chance of death or contamination.</small></div>';
		
		return str;
	}

	Horticookie.initCodes = function(){
		Horticookie.recipeCodes = {};
		Horticookie.statusCodes = {};
		
		Horticookie.recipeCodes.NORMAL = 1;
		Horticookie.recipeCodes.WEED = 2;
		Horticookie.recipeCodes.CREATED_ON_KILL = 3;
		
		Horticookie.statusCodes.MAYGROW = 1;
		Horticookie.statusCodes.PREMATURE = 2;
		Horticookie.statusCodes.MATURE = 3;
		Horticookie.statusCodes.DANGER = 4;
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
				value = Math.round(value * 100 * Horticookie.percentagePow10);
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

	Horticookie.calcProbAgingGT = function(N, ageTick, ageTickR, ageBoost) {
		if(N % 1 != 0) {
			throw "In calcProbAgingGT, N must be an integer, got " + N;
		}
		if(N <= 0) {
			return 1;
		}
		ageTick *= ageBoost;
		ageTickR *= ageBoost;
		var p1 = 0;
		var p2 = 0;
		var p3 = 0;
		if(ageTickR > 0) {
			// Probability that ageTick + ageTickR * Math.random() will be less than N - 1
			p1 = (N - 1 - ageTick) / ageTickR;
			p1 = Math.min(Math.max(p1, 0), 1);
			
			// Probability that ageTick + ageTickR * Math.random() will be greater than N
			p2 = (ageTickR - N + ageTick) / ageTickR;
			p2 = Math.min(Math.max(p2, 0), 1);
		} else {
			p1 = (ageTick < N - 1 ? 1 : 0);
			p2 = (ageTick >= N ? 1 : 0);
		}

		if(p1 + p2 < 1) {
			/*
			 * Probability that if ageTick + ageTickR * Math.random() is between N - 1 and N,
			 * it will be rounded to N. I hope my analysis of the probability disribution was
			 * correct.
			 */
			 var a = (ageTick < N - 1 ? 0 : ageTick % 1);
			 var b = (ageTick + ageTickR < N ? ageTickR % 1 : 1 - a);
			 p3 = (1 - p1 - p2) * (a + b / 2);
		}
		
		return p2 + p3;
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
		//    Nonstandard recipes go first
		//***********************************
		Horticookie.mutationsMap.push({type:Horticookie.recipeCodes.WEED, product:['meddleweed', 0.002]});
		Horticookie.mutationsMap.push({type:Horticookie.recipeCodes.CREATED_ON_KILL, prereq:'meddleweed', product:['brownMold', 0.1]});
		Horticookie.mutationsMap.push({type:Horticookie.recipeCodes.CREATED_ON_KILL, prereq:'meddleweed', product:['crumbspore', 0.1]});
		
		
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

	Horticookie.buildUpgradesMap = function(){
		var M = Horticookie.M;
		Horticookie.upgradesMap = [];
		
		for(var key in M.plants){
			var plant = M.plants[key];
			if(plant.onHarvest){
				var func = plant.onHarvest.toString();
				var pos = func.indexOf("M.dropUpgrade");
				if(pos > 0){
					var temp = func.substring(func.indexOf("(", pos) + 1, func.indexOf(")", pos));
					temp = temp.split(",");
					Horticookie.upgradesMap[key] = [eval(temp[0]), eval(temp[1])];
				}
			}
		}
	}

	Horticookie.backupPlants = function(){
		var M = Horticookie.M;
		Horticookie.Backup.plants = {};
		
		for(var key in M.plants){
			Horticookie.Backup.plants[key] = {};
			for(var child in M.plants[key]){
				Horticookie.Backup.plants[key][child] = M.plants[key][child];
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

	Horticookie.recipeUnlocked = function(recipe){
		var M = Horticookie.M;
		if(recipe.type == Horticookie.recipeCodes.NORMAL){
			for(var i = 0; i < recipe.neighs.length; i++){
				if(recipe.neighs[i].isMax) continue;
				if(Horticookie.plantStatus[recipe.neighs[i].plant].status < Horticookie.statusCodes.PREMATURE) return false;
			}
			for(var i = 0; i < recipe.neighsM.length; i++){
				if(recipe.neighsM[i].isMax) continue;
				if(Horticookie.plantStatus[recipe.neighsM[i].plant].status < Horticookie.statusCodes.MATURE) return false;
			}
		}
		
		return true;
	}

	Horticookie.getNTP = function(x, y){
		if (x < 0 || x >= Horticookie.maxPlotWidth || y < 0 || y >= Horticookie.maxPlotHeight || !Horticookie.M.isTileUnlocked(x, y)) return undefined;
		return Horticookie.nextTickProbabilities[y][x];
	}

	Horticookie.getOutcomes = function(ntp){
		var res = [];
		
		for(var key in ntp.immature) res.push({key:key, type:1, chance:ntp.immature[key]});
		for(var key in ntp.mature) res.push({key:key, type:2, chance:ntp.mature[key]});
		if(ntp.empty) res.push({key:'', type:0, chance:ntp.empty});
		
		return res;
	}

	Horticookie.toHTML = function(recipe){
		var M = Horticookie.M;
		var res = '';
		var limiters = [];
		
		switch(recipe.type){
			case Horticookie.recipeCodes.NORMAL:
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
				break;
				
			case Horticookie.recipeCodes.WEED:
				res = "<b>Weed: grows spontaneously on empty tiles with no neighbors (" + Horticookie.formatPercentage(recipe.product[1]) + " each tick)</b>"
				break;
				
			case Horticookie.recipeCodes.CREATED_ON_KILL:
				res = "May sprout from <b>" + M.plants[recipe.prereq].name + "</b> (AA) when it's harvested (up to <b>" + Horticookie.formatPercentage(recipe.product[1]) + "</b>, the older the better)"
				break;
				
		}
		
		
		return res;
	}

	Horticookie.Feynman = function(list){
		// This function calculates the probability of each element of a list being chosen when each element has only a chance of being in the list in the first place.
		// And it does it with MAXIMUM EFFORT
		var res = [];
		var bitStr = [];
		var bitLength = list.length;
		var comboCount = Math.pow(2, bitLength);
		var comboChance, comboSum;
		var i, j;
		var toggle = false;
		
		// Initialize bitStr
		for(i = 0; i < bitLength; i++) bitStr[i] = 0;
		bitStr[0] = -1;
		
		// Initialize res
		for(i = 0; i < bitLength; i++){
			res.push({key: list[i].key, chance: 0});
		}
		
		// Loop through every possible combination
		for(i = 0; i < comboCount; i++){
			j = 0;
			do{
				toggle = false;
				bitStr[j]++;
				if(bitStr[j] == 2){bitStr[j] = 0; toggle = true; j++;}
			}while(toggle && j < bitLength);
			
			comboChance = 1;
			comboSum = 0;
			for(j = 0; j < bitLength; j++){
				comboChance *= (bitStr[j] ? list[j].chance : (1 - list[j].chance));
				comboSum += bitStr[j];
			} 
			
			for(j = 0; j < bitLength; j++) res[j].chance += (bitStr[j] ? (comboChance / comboSum) : 0);
		}
		
		return res;
	}

	Horticookie.getCurrentPlot = function(){
		var M = Horticookie.M;
		for(var y = 0; y < Horticookie.maxPlotHeight; y++){
			for(var x = 0; x < Horticookie.maxPlotWidth; ++x) {
				var id = M.plot[y][x][0];
				var ntp = {empty: 1, immature: {}, mature: {}};
				
				if(id > 0){
					var plant = M.plantsById[id - 1];
					ntp.empty = 0;
					if(M.plot[y][x][1] >= plant.mature) ntp.mature[plant.key] = 1;
					else ntp.immature[plant.key] = 1;
				}
				
				Horticookie.nextTickProbabilities[y][x] = ntp;
			}
		}
	}

	Horticookie.recalcPlantTile = function(x, y, weedMult, tile, plant){
		var M = Horticookie.M;
		var tile_boost = M.plotBoost[y][x];
		var ntp = Horticookie.getNTP(x, y);
		var probMature = Horticookie.calcProbAgingGT(Math.ceil(plant.mature - tile[1]), plant.ageTick, plant.ageTickR, tile_boost[0]);
		var probDeath = plant.immortal ? 0 : Horticookie.calcProbAgingGT(Math.ceil(100 - tile[1]), plant.ageTick, plant.ageTickR, tile_boost[0]);
		
		ntp.empty = probDeath;
		ntp.mature[plant.key] = (1 - probDeath) * probMature;
		ntp.immature[plant.key] = (1 - probDeath) * (1 - probMature);
		
		if(!plant.noContam && !plant.immortal){
			var list = [];
			var list2 = {};
			
			for (var i in M.plantContam){
				list.push({key: i, chance: (M.plantContam[i] * (M.plants[i].weed ? Math.min(1, weedMult) : 1))});
			}
			
			list = Horticookie.Feynman(list);
			for(var i = 0; i < list.length; i++) list2[list[i].key] = list[i].chance;
			
			if(list2[plant.key]) delete list2[plant.key];
			
			var neighsM = {}; // all surrounding mature plants
			for(var i in M.plants){neighsM[i] = 0;}
			var ntpNeigh = Horticookie.getNTP(x, y - 1); if(ntpNeigh) for(var key in ntpNeigh.mature){neighsM[key] = (neighsM[key] ? neighsM[key] : 1) * ntpNeigh.mature[key];}
			var ntpNeigh = Horticookie.getNTP(x, y + 1); if(ntpNeigh) for(var key in ntpNeigh.mature){neighsM[key] = (neighsM[key] ? neighsM[key] : 1) * ntpNeigh.mature[key];}
			var ntpNeigh = Horticookie.getNTP(x - 1, y); if(ntpNeigh) for(var key in ntpNeigh.mature){neighsM[key] = (neighsM[key] ? neighsM[key] : 1) * ntpNeigh.mature[key];}
			var ntpNeigh = Horticookie.getNTP(x + 1, y); if(ntpNeigh) for(var key in ntpNeigh.mature){neighsM[key] = (neighsM[key] ? neighsM[key] : 1) * ntpNeigh.mature[key];}
			
			for(var i in list2) if(neighsM[i] > 0){
				for(var key in ntp.mature)   ntp.mature[key]   *= 1 - list2[i] * neighsM[i];
				for(var key in ntp.immature) ntp.immature[key] *= 1 - list2[i] * neighsM[i];
				ntp.immature[i] = list2[i] * (1 - ntp.empty) * neighsM[i];
			}
		}
		
		
		//***********************************
		//    Delete 0% possibilities
		//***********************************
		for(var key in ntp.mature)   if(ntp.mature[key]   == 0) delete ntp.mature[key];
		for(var key in ntp.immature) if(ntp.immature[key] == 0) delete ntp.immature[key];
	}

	Horticookie.recalcEmptyTile = function(x, y, weedMult, loops){
		var M = Horticookie.M;
		var tile_boost = M.plotBoost[y][x];
		var ntp = Horticookie.getNTP(x, y);
		
		ntp.empty = 1;
		for(var i in M.plants){ntp.immature[i] = 0;}
		var ntpLooped = JSON.parse(JSON.stringify(ntp));
		
		var nextCombo = function(combos){
			var toggle = true;
			var i = 0;
			while(toggle && i < combos.length){
				toggle = false;
				combos[i].current++;
				if(combos[i].current >= combos[i].length){
					combos[i].current = 0;
					toggle = true;
					i++;
				}
			}
			
			return !toggle; // return false if the loop ended because we ran out of combos, otherwise return true
		}
		
		
		var neighbors = [];
		var neigh = Horticookie.getNTP(x, y - 1);     if(neigh && neigh.empty != 1){neighbors.push(neigh);}
		var neigh = Horticookie.getNTP(x, y + 1);     if(neigh && neigh.empty != 1){neighbors.push(neigh);}
		var neigh = Horticookie.getNTP(x - 1, y);     if(neigh && neigh.empty != 1){neighbors.push(neigh);}
		var neigh = Horticookie.getNTP(x + 1, y);     if(neigh && neigh.empty != 1){neighbors.push(neigh);}
		var neigh = Horticookie.getNTP(x - 1, y - 1); if(neigh && neigh.empty != 1){neighbors.push(neigh);}
		var neigh = Horticookie.getNTP(x - 1, y + 1); if(neigh && neigh.empty != 1){neighbors.push(neigh);}
		var neigh = Horticookie.getNTP(x + 1, y - 1); if(neigh && neigh.empty != 1){neighbors.push(neigh);}
		var neigh = Horticookie.getNTP(x + 1, y + 1); if(neigh && neigh.empty != 1){neighbors.push(neigh);}
		
		var combos = [];
		for(var i = 0; i < neighbors.length; i++){
			var outcomes = Horticookie.getOutcomes(neighbors[i]);
			if(outcomes.length > 0) combos.push({length:outcomes.length, current:0, outcomes:outcomes});
		}
		
		do{
			var any = 0;
			var comboChance = 1;
			var neighs = [];
			var neighsM = [];
			for(var i in M.plants){neighs[i] = 0;}
			for(var i in M.plants){neighsM[i] = 0;}
			
			for(var i = 0; i < combos.length; i++){
				var outcome = combos[i].outcomes[combos[i].current]
				comboChance *= outcome.chance;
				if(outcome.type == 1){any++; neighs[outcome.key]++;}
				if(outcome.type == 2){any++; neighs[outcome.key]++; neighsM[outcome.key]++;}
			}
			
			if(any > 0){
				var muts = M.getMuts(neighs, neighsM);
				var list = [];
				var list2 = {};
				
				for(var ii = 0; ii < muts.length; ii++){
					var chance = muts[ii][1];
					chance *= (M.plants[muts[ii][0]].weed ? Math.min(1, weedMult) : 1);
					chance *= ((M.plants[muts[ii][0]].weed || M.plants[muts[ii][0]].fungus) ? Math.min(1, M.plotBoost[y][x][2]) : 1);
					list.push({key: muts[ii][0], chance: (chance*comboChance)});
				}
				
				list = Horticookie.Feynman(list);
				
				for(var i = 0; i < list.length; i++){ list2[list[i].key] = 0; }
				for(var i = 0; i < list.length; i++){ list2[list[i].key] = 1 - (1 - list2[list[i].key]) * (1 - list[i].chance); }
				for(var key in list2){
					ntp.immature[key] += list2[key];
					ntpLooped.immature[key] += list2[key];
					ntp.empty -= list2[key];
					ntpLooped.empty -= list2[key];
				}
			} else {
				//weeds in empty tiles (no other plants must be nearby)
				var chance = 0.002 * weedMult * M.plotBoost[y][x][2];
				ntp.immature['meddleweed'] += chance * comboChance;
				ntp.empty -= chance;
			}
			
		}while(nextCombo(combos));
		
		//***********************************
		//    Things get loopy
		//***********************************
		for(var i = 1; i < loops; i++){
			for(var key in ntp.immature){
				ntp.immature[key] = ntpLooped.immature[key] + ntp.immature[key] * ntpLooped.empty;
			}
			ntp.empty *= ntpLooped.empty;
		}
		
		//***********************************
		//    Delete 0% possibilities
		//***********************************
		for(var key in ntp.mature)   if(ntp.mature[key]   == 0) delete ntp.mature[key];
		for(var key in ntp.immature) if(ntp.immature[key] == 0) delete ntp.immature[key];
	}

	Horticookie.recalcTileStatus = function(){
		var M = Horticookie.M;
		Horticookie.getCurrentPlot();
		
		M.computeBoostPlot();
		M.computeMatures();
		
		var weedMult = M.soilsById[M.soil].weedMult;
		var loops = 1;
		if (M.soilsById[M.soil].key == 'woodchips') loops = 3;
		
		if(Horticookie.detectKUGardenPatch()){
			for(var y = 0; y < Horticookie.maxPlotHeight; y++){
				for(var x = 0; x < Horticookie.maxPlotWidth; x++){
					if(M.isTileUnlocked(x, y)){
						var tile = M.plot[y][x];
						var plant = M.plantsById[tile[0] - 1];
						if(tile[0] > 0){
							Horticookie.recalcPlantTile(x, y, weedMult, tile, plant);
						}else{
							//Horticookie.recalcEmptyTile(x, y, weedMult, loops);
						}
					}
				}
			}
			for(var y = 0; y < Horticookie.maxPlotHeight; y++){
				for(var x = 0; x < Horticookie.maxPlotWidth; x++){
					if(M.isTileUnlocked(x, y)){
						var tile = M.plot[y][x];
						var plant = M.plantsById[tile[0] - 1];
						if(tile[0] > 0){
							//Horticookie.recalcPlantTile(x, y, weedMult, tile, plant);
						}else{
							Horticookie.recalcEmptyTile(x, y, weedMult, loops);
						}
					}
				}
			}
		}else{
			for(var y = 0; y < Horticookie.maxPlotHeight; y++){
				for(var x = 0; x < Horticookie.maxPlotWidth; x++){
					if(M.isTileUnlocked(x, y)){
						var tile = M.plot[y][x];
						var plant = M.plantsById[tile[0] - 1];
						if(tile[0] > 0){
							Horticookie.recalcPlantTile(x, y, weedMult, tile, plant);
						}else{
							Horticookie.recalcEmptyTile(x, y, weedMult, loops);
						}
					}
				}
			}
		}
	}

	Horticookie.recalcPlantStatus = function(){
		var M = Horticookie.M;
		Horticookie.plantStatus = {};
		
		for(var key in M.plants) Horticookie.plantStatus[key] = {status:0, probGrowthNextTick:0};
		
		
		for(var y = 0; y < Horticookie.maxPlotHeight; y++)
		for(var x = 0; x < Horticookie.maxPlotWidth; x++){
			if(M.isTileUnlocked(x, y)){
				var tile = M.plot[y][x];
				var ntp = Horticookie.nextTickProbabilities[y][x];
				
				// Calculate probability of sprouting
				for(var key in ntp.immature){
					var ps = Horticookie.plantStatus[key];
					ps.probGrowthNextTick = 1 - ((1 - ps.probGrowthNextTick) * (1 - ntp.immature[key]));	
					ps.status = Math.max(ps.status, Horticookie.statusCodes.MAYGROW);
				}
				
				if(tile[0] != 0){
					var plant = M.plantsById[tile[0] - 1];
					var ps = Horticookie.plantStatus[plant.key];
					
					if(tile[1] >= plant.mature){
						if(Horticookie.config.autoHarvest && (!plant.unlocked || plant.key == 'queenbeetLump' || !Horticookie.dropUnlocked(plant))){
							M.clickTile(x, y);
							Horticookie.recalcTileStatus();
						}else{
							ps.status = Math.max(ps.status, Horticookie.statusCodes.MATURE);
						}
					}else{
						ps.status = Math.max(ps.status, Horticookie.statusCodes.PREMATURE);
						
					}
					
					if(ntp.immature[plant.key] + ntp.mature[plant.key] < 1) ps.status = Math.max(ps.status, Horticookie.statusCodes.DANGER);
				}
			}
		}
		
		
		for(var key in M.plants){
			if(M.plants[key].unlocked){
				Horticookie.plantStatus[key].status = Horticookie.statusCodes.UNLOCKED;
			}
		}
	}
	
	Horticookie.dropUnlocked = function(plant){
		if(plant.onHarvest){
			var onHarvest = plant.onHarvest.toString();
			if(onHarvest.indexOf('dropUpgrade') != -1){
				var pos = onHarvest.indexOf('dropUpgrade') + "dropUpgrade('".length;
				var len = onHarvest.indexOf("'", pos);
				var upgrade = onHarvest.substring(pos, len);
				
				return Game.HasUnlocked(upgrade);
			}
		}
		
		return true; // default value: no upgrade to unlock
	}

	Horticookie.recalcUnlockables = function(){
		var M = Horticookie.M;
		Horticookie.unlockables = {};
		Horticookie.unlockableCount = 0;
		
		for(var i = 0; i < Horticookie.mutationsMap.length; i++){
			var mut = Horticookie.mutationsMap[i];
			var unlockable = true;
			
			if(mut.type == Horticookie.recipeCodes.NORMAL){
				for(var j = 0; j < mut.neighsM.length; j++){
					if(mut.neighsM[j].isMax) continue;
					if(Horticookie.plantStatus[mut.neighsM[j].plant].status < Horticookie.statusCodes.PREMATURE) unlockable = false;
				}
				for(var j = 0; j < mut.neighs.length; j++){
					if(mut.neighs[j].isMax) continue;
					if(Horticookie.plantStatus[mut.neighs[j].plant].status < Horticookie.statusCodes.PREMATURE) unlockable = false;
				}
				
				if(unlockable) Horticookie.unlockables[mut.product[0]] = true;
			} 
			else if(mut.type == Horticookie.recipeCodes.WEED){
				Horticookie.unlockables[mut.product[0]] = true;
			}
			else if(mut.type == Horticookie.recipeCodes.CREATED_ON_KILL){
				if(Horticookie.plantStatus[mut.prereq].status >= Horticookie.statusCodes.PREMATURE) Horticookie.unlockables[mut.product[0]] = true;
			}
		}
		
		for(var key in Horticookie.unlockables){
			if(M.plants[key].unlocked) delete Horticookie.unlockables[key];
			else Horticookie.unlockableCount++;
		} 
	}

	Horticookie.recalcAlerts = function(){
		var M = Horticookie.M;
		var ipid = false;
		var nps = false;
		var md = false;
	}

	Horticookie.draw = function(){
		if(Game.drawT % 10 === 0) {
			// The original garden updates this just like here
			if(Horticookie.unlockableCount) {
				var tmp = document.getElementById('gardenSeedsUnlocked');
				if(tmp) {
					var M = Horticookie.M;
					tmp.innerHTML = 'Seeds <small>(' + M.plantsUnlockedN + '/' + M.plantsN + ' + ' + Horticookie.unlockableCount + ')</small>';
				}
			}
		}
	}


	//***********************************
	//    Functions that override the main game
	//***********************************
	Horticookie.computeEffs = function(){
		Horticookie.recalcTileStatus();
		Horticookie.recalcPlantStatus();
		Horticookie.M.buildPanel();
		if(!Horticookie.M.freeze) Horticookie.recalcAlerts();
	}

	Horticookie.seedTooltip = function(id, str){
		var M = Horticookie.M;
		var tt = str;
		if(id < 0 || id >= M.plantsById.length) {
			return tt;
		} else {
			var plant = M.plantsById[id];
			var recipes = Horticookie.getRecipes(plant);
			var rhtml = '';
			var ps = Horticookie.plantStatus[plant.key];
			
			if(ps.status === Horticookie.statusCodes.DANGER) {
				rhtml = '<span class="red">This plant is growing in your garden, and is in danger</span>';
			} else if(ps.status === Horticookie.statusCodes.PREMATURE) {
				rhtml = '<span class="green">This plant is growing in your garden</span>';
			} else if(ps.status === Horticookie.statusCodes.MATURE) {
				rhtml = '<span class="green"><b>This plant is mature in your garden</b></span>';
			} else if(ps.status === Horticookie.statusCodes.MAYGROW) {
				rhtml = '<b>This plant may grow in your garden next tick (' + Horticookie.formatPercentage(ps.probGrowthNextTick) +')</b>';
			} else if(ps.status !== Horticookie.statusCodes.UNLOCKED) {
				rhtml = "You haven't unlocked this seed yet";
			}
			if(rhtml) {
				rhtml = '<div style="white-space: nowrap; text-align: center; margin-bottom: 0.25em;">' + rhtml + '</div>';
			}
			
			for(var k = 0; k < recipes.length; ++k) {
				var hh = Horticookie.toHTML(recipes[k]);
				if(!Horticookie.recipeUnlocked(recipes[k])) {
					hh = '<s>' + hh + '</s>';
				}
				rhtml += '<div style="white-space: nowrap; margin-top: 0.5em;">' + hh + '</div>';
			}
			
			if(rhtml) {
				return tt.replace(/<\/div>$/, '<div class="line"></div>' + rhtml +
								  '<div style="margin-top: 0.5em; text-align: center;">' +
								  '<small>(M) = mature, (AA) = any age</small></div></div>');
			} else {
				return tt;
			}
		}
	}

	Horticookie.tileTooltip = function(x, y, ret){
		var M = Horticookie.M;
		var compare = function(a, b) {return (a < b ? -1 : (a > b ? 1 : 0));}
		
		var str = ret;
		if(!M.isTileUnlocked(x, y)) {
			return str;
		} else {
			var tile = M.plot[y][x];
			var msg;
			var ntp = Horticookie.getNTP(x, y);
			
			if(tile[0] === 0) {
				if(ntp.empty === 1) {
					msg = "<b>Will remain empty next tick</b>";
				} else {
					msg = "<div class='line'></div><b>These plants can grow here next tick:</b><br><br><div style='text-align: left;'>";
					
					var nextmuts = [];
					for(var key in ntp.immature) nextmuts.push([M.plants[key].name, ntp.immature[key]]);
					
					nextmuts.sort(function(a, b) { return -compare(a[1], b[1]); });
					for(var i = 0; i < nextmuts.length; ++i) {
						msg += "<b>" + nextmuts[i][0] + ":</b> " + Horticookie.formatPercentage(nextmuts[i][1]) + "<br>";
					}
					
					msg += "<b>[Nothing]:</b> " + Horticookie.formatPercentage(ntp.empty);
					msg += "</div>";
				}
				
			} else {
				msg = '';
				var plant = M.plantsById[tile[0] - 1];
				var tmp;
				var dh = '<div style="margin-top: 0.5em"';
				
				if(tile[1] < plant.mature) {
					tmp = ntp.mature[plant.key];
					if(tmp === 1) {
						msg = dh + ' class="green">Will mature next tick (<b>100%</b>)</div>'
					} else if(tmp > 0) {
						msg = dh + ' class="green">May mature next tick (<b>' + Horticookie.formatPercentage(tmp) + '</b>)</div>';
					}
				}
				
				if(ntp.empty === 1) {
					msg += dh + ' class="red">Will die next tick (<b>100%</b>)</div>'
				} else if(ntp.empty) {
					msg += dh + ' class="red">May die next tick (<b>' + Horticookie.formatPercentage(ntp.empty) + '</b>)</span>';
				}
				
				var contam = [];
				for(var key in ntp.immature) {
					var p = ntp.immature[key];
					if(key !== plant.key && p > 0) {
						contam.push([M.plants[key].name, p]);
					}
					contam.sort(function(a, b) { return -compare(a[1], b[1]); });
				}
				if(contam) {
					for(var i = 0; i < contam.length; ++i) {
						msg += dh + ' class="red">May be overtaken by <b>' + contam[i][0] + '</b> (<b>' + Horticookie.formatPercentage(contam[i][1]) + '</b>)</div>';
					}
				}
				
				if(msg) {
					msg = '<div class="line"></div>' + msg;
				}
			}
			
			if(msg) {
				return str.replace(/<q>.*<\/q>/, '').replace(/<\/div>$/, msg + '</div>');
			} else {
				return str;
			}
		}
	}

	Horticookie.getPlantDesc = function(me, ret){
		
		if(Horticookie.upgradesMap[me.key] && !Game.HasUnlocked(Horticookie.upgradesMap[me.key][0])){
			ret = ret.replace(/<\/div>$/,
				'<div class="line"></div>' +
				'<div style="text-align: center; white-space: nowrap;">' +
				'When harvested mature, may drop <span class="green">' + Horticookie.upgradesMap[me.key][0] +
				'</span> (<b>' + Horticookie.formatPercentage(Horticookie.upgradesMap[me.key][1]) + '</b>)</div></div>');
		}
		
		return ret;
	}

	Horticookie.buildPanel = function(){
		var M = Horticookie.M;
		Horticookie.recalcUnlockables();
		
		if(Horticookie.unlockableCount) {
			for(var key in Horticookie.unlockables) {
				var el = document.getElementById('gardenSeed-' + M.plants[key].id);
				if(el) {
					var elc = el.cloneNode(true);
					elc.style.opacity = 0.3;
					elc.classList.remove('locked');
					el.parentNode.replaceChild(elc, el);
				}
			}
		}
	}

	Horticookie.unlockSeed = function(me) {
		Horticookie.recalcPlantStatus();
		Horticookie.M.buildPanel();
	}

	Horticookie.lockSeed = function(me) {
		Horticookie.recalcPlantStatus();
		Horticookie.M.buildPanel();
	}


	//***********************************
	//    Inject into the main game
	//***********************************
	Horticookie.ReplaceMainGame = function(){
		Game.customOptionsMenu.push(function(){
			CCSE.AppendCollapsibleOptionsMenu(Horticookie.name, Horticookie.getMenuString());
		});
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(Horticookie.name, Horticookie.version);
		});
		
		// Set up for Accelerated Garden
		Game.customRandomFloor.push(function(x, ret){
			if(Horticookie.config.accelGarden) return Math.ceil(x);
			else return ret;
		});
			
	}

	Horticookie.ReplaceNativeGarden = function() {
		var objKey = 'Farm';
		
		if(!Game.customMinigame[objKey].computeEffs)  Game.customMinigame[objKey].computeEffs = [];
		if(!Game.customMinigame[objKey].tileTooltip)  Game.customMinigame[objKey].tileTooltip = [];
		if(!Game.customMinigame[objKey].seedTooltip)  Game.customMinigame[objKey].seedTooltip = [];
		if(!Game.customMinigame[objKey].getPlantDesc) Game.customMinigame[objKey].getPlantDesc = [];
		if(!Game.customMinigame[objKey].buildPanel)   Game.customMinigame[objKey].buildPanel = [];
		if(!Game.customMinigame[objKey].unlockSeed)   Game.customMinigame[objKey].unlockSeed = [];
		if(!Game.customMinigame[objKey].lockSeed)     Game.customMinigame[objKey].lockSeed = [];
		
		Game.customMinigame[objKey].computeEffs.push(Horticookie.computeEffs);
		Game.customMinigame[objKey].tileTooltip.push(Horticookie.tileTooltip);
		Game.customMinigame[objKey].seedTooltip.push(Horticookie.seedTooltip);
		Game.customMinigame[objKey].getPlantDesc.push(Horticookie.getPlantDesc);
		Game.customMinigame[objKey].buildPanel.push(Horticookie.buildPanel);
		Game.customMinigame[objKey].unlockSeed.push(Horticookie.unlockSeed);
		Game.customMinigame[objKey].lockSeed.push(Horticookie.lockSeed);
		
		CCSE.MinigameReplacer(function(){
			var objKey = 'Farm';
			var M = Game.Objects[objKey].minigame;
			
			Horticookie.initWithGarden(M);
			
			M.toRebuild = true;
			M.buildPanel();
		}, 'Farm');
		
	}




	//***********************************
	//    Compatability with Klattmose Utilities Garden patch
	//***********************************
	Horticookie.detectKUGardenPatch = function(){
		if(typeof KlattmoseUtilities == 'undefined') return false;
		if(typeof KlattmoseUtilities.config == 'undefined') return false;
		if(typeof KlattmoseUtilities.config.patches == 'undefined') return false;
		
		return KlattmoseUtilities.config.patches.gardenOrderofOperations == 1;
	}
	
	
	if(CCSE.ConfirmGameVersion(Horticookie.name, Horticookie.version, Horticookie.GameVersion)) Game.registerMod(Horticookie.name, Horticookie); // Horticookie.init();
}


if(!Horticookie.isLoaded){
	if(CCSE && CCSE.isLoaded){
		Horticookie.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(Horticookie.launch);
	}
}
