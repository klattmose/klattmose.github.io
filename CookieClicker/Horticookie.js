Game.Win('Third-party');
if(Horticookie === undefined) var Horticookie = {};


Horticookie.init = function(){
	Horticookie.isLoaded = 1;
	Horticookie.Backup = {};
	Horticookie.M = Game.Objects["Farm"].minigame;
	Horticookie.buildMutMap();
	
	
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


Horticookie.buildMutMap = function(){
	var M = Horticookie.M;
	var getMuts = M.getMuts.toString();
	Horticookie.mutsMap = [];
	
	//***********************************
	//    Some functions that I want to put here instead of elsewhere
	//***********************************
	function newMut(source){return {source:source, neighs:[], neighsM:[], product:[]};}
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
			else if(lte){isMax = true;}
			else if(lt) {isMax = true; digit--;}
			
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
					
					Horticookie.mutsMap.push(mut);
				}
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
		
		M.computeEffs = function(){
			Horticookie.Backup.computeEffs();
			
		}
		
		
		Horticookie.HasReplaceNativeGardenLaunch = true;
	}
}



if(!Horticookie.isLoaded) Horticookie.init();