Game.Win('Third-party');
if(CCSE === undefined) var CCSE = {};
CCSE.name = 'CCSE';
CCSE.version = '0.28';
CCSE.GameVersion = '2.019';

CCSE.launch = function(){
	
	CCSE.init = function(){
		// Define more parts of CCSE
		CCSE.Backup = {};
		CCSE.collapseMenu = {};
	
		
		// Inject the hooks into the main game
		CCSE.ReplaceMainGame();
		
		
		// Show the version number in Stats
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(CCSE.name, CCSE.version);
		});
		
		
		// Announce completion, set the isLoaded flag, and run any functions that were waiting for this to load
		if (Game.prefs.popups) Game.Popup('CCSE loaded!');
		else Game.Notify('CCSE loaded!', '', '', 1, 1);
		CCSE.isLoaded = 1;
		if(CCSE.postLoadHooks) for(var i in CCSE.postLoadHooks) CCSE.postLoadHooks[i]();
	}
	
	
	/*=====================================================================================
	Do all replacing in one function
	Also declare hook arrays in the close vicinity of the functions they get used in
	=======================================================================================*/
	CCSE.ReplaceMainGame = function(){
		// Temporary variable for storing function strings
		// Slightly more efficient than nesting functions
		// Doubt it really matters
		var temp = '';
		var pos = 0;
		var proto;
		var obj;
		
		
		// Game.UpdateMenu
		if(!Game.customMenu) Game.customMenu = [];
		if(!Game.customOptionsMenu) Game.customOptionsMenu = [];
		if(!Game.customStatsMenu) Game.customStatsMenu = [];
		if(!Game.customInfoMenu) Game.customInfoMenu = [];
		
		temp = Game.UpdateMenu.toString();
		eval('Game.UpdateMenu = ' + temp.slice(0, -1) + `
			if(Game.onMenu == 'prefs'){
				for(var i in Game.customOptionsMenu) Game.customOptionsMenu[i]();
			}
			else if(Game.onMenu == 'stats'){
				for(var i in Game.customStatsMenu) Game.customStatsMenu[i]();
			}
			else if(Game.onMenu == 'log'){
				for(var i in Game.customInfoMenu) Game.customInfoMenu[i]();
			}
			
			// Any that don't want to fit into a label
			for(var i in Game.customMenu) Game.customMenu[i]();
		` + temp.slice(-1));
		
		
		// Game.LoadSave
		// I do a check before replacing this one. Game.customLoad is already in the game, just unused
		// Need to do a nesting replace because Game.LoadSave returns a value
		// This value is passed to the custom functions as ret
		if(!(Game.LoadSave.toString().indexOf('Game.customLoad') > 0)){
			CCSE.Backup.LoadSave = Game.LoadSave;
			Game.LoadSave = function(data){
				var ret = CCSE.Backup.LoadSave(data);
				for(var i in Game.customLoad) ret = Game.customLoad[i](ret);
				return ret;
			}
		}
		
		
		// randomFloor
		// Return ret to have no effect
		if(!Game.customRandomFloor) Game.customRandomFloor = []; 
		CCSE.Backup.randomFloor = randomFloor;
		randomFloor = function(x){
			var ret = CCSE.Backup.randomFloor(x);
			for(var i in Game.customRandomFloor) ret = Game.customRandomFloor[i](x, ret);
			return ret;
		}
		
		
		// Beautify
		// Return ret to have no effect
		if(!Game.customBeautify) Game.customBeautify = []; 
		CCSE.Backup.Beautify = Beautify;
		Beautify = function(value, floats){
			var ret = CCSE.Backup.Beautify(value, floats);
			for(var i in Game.customBeautify) ret = Game.customBeautify[i](value, floats, ret);
			return ret;
		}
		
		
		// Game.Loader.Load
		temp = Game.Loader.Load.toString();
		eval('Game.Loader.Load = ' + temp.replace('img.src=this.domain', 
			"img.src=(assets[i].indexOf('http')>=0?'':this.domain)"));
		
		
		// -----     Tooltips block     ----- //
		
		// Game.tooltip.draw
		if(!Game.customTooltipDraw) Game.customTooltipDraw = [];
		temp = Game.tooltip.draw.toString();
		eval('Game.tooltip.draw = ' + temp.slice(0, -1) + 
			'\nfor(var i in Game.customTooltipDraw) Game.customTooltipDraw[i](from, text, origin);\n' 
			+ temp.slice(-1));
		
		
		// Game.tooltip.update
		if(!Game.customTooltipUpdate) Game.customTooltipUpdate = [];
		temp = Game.tooltip.update.toString();
		eval('Game.tooltip.update = ' + temp.slice(0, -1) + 
			'\nfor(var i in Game.customTooltipUpdate) Game.customTooltipUpdate[i]();\n' + 
			temp.slice(-1));
		
		
		// -----     Ascension block     ----- //
		
		// Game.GetHeavenlyMultiplier
		// Functions should return a value to multiply the heavenlyMult by
		if(!Game.customHeavenlyMultiplier) Game.customHeavenlyMultiplier = []; 
		temp = Game.GetHeavenlyMultiplier.toString();
		eval('Game.GetHeavenlyMultiplier = ' + temp.replace('return heavenlyMult;', `
			for(var i in Game.customHeavenlyMultiplier) heavenlyMult *= Game.customHeavenlyMultiplier[i]();
			return heavenlyMult;`));
		
		
		// Game.Reincarnate
		// Only runs when bypass == 1 (i.e. passed the confirmation prompt)
		if(!Game.customReincarnate) Game.customReincarnate = [];
		temp = Game.Reincarnate.toString();
		pos = temp.lastIndexOf('}', temp.length - 2)
		eval('Game.Reincarnate = ' + temp.slice(0, pos) + `
				for(var i in Game.customReincarnate) Game.customReincarnate[i]();
			` + temp.slice(pos));
		
		
		// Game.Ascend
		// Only runs when bypass == 1 (i.e. passed the confirmation prompt)
		if(!Game.customAscend) Game.customAscend = [];
		temp = Game.Ascend.toString();
		pos = temp.lastIndexOf('}', temp.length - 2)
		eval('Game.Ascend = ' + temp.slice(0, pos) + `
				for(var i in Game.customAscend) Game.customAscend[i]();
			` + temp.slice(pos));
		
		
		// Game.UpdateAscend
		// Runs every frame while on the Ascension tree
		if(!Game.customUpdateAscend) Game.customUpdateAscend = [];
		temp = Game.UpdateAscend.toString();
		eval('Game.UpdateAscend = ' + temp.slice(0, -1) + `
			for(var i in Game.customUpdateAscend) Game.customUpdateAscend[i](); 
		` + temp.slice(-1));
		
		
		// -----     Sugar Lumps block     ----- //
		
		// Game.computeLumpTimes
		if(!Game.customComputeLumpTimes) Game.customComputeLumpTimes = [];
		temp = Game.computeLumpTimes.toString();
		eval('Game.computeLumpTimes = ' + temp.slice(0, -1) + `
			for(var i in Game.customComputeLumpTimes) Game.customComputeLumpTimes[i](); 
		` + temp.slice(-1));
		
		
		// Game.gainLumps
		if(!Game.customGainLumps) Game.customGainLumps = [];
		temp = Game.gainLumps.toString();
		eval('Game.gainLumps = ' + temp.slice(0, -1) + `
			for(var i in Game.customGainLumps) Game.customGainLumps[i](total); 
		` + temp.slice(-1));
		
		
		// Game.clickLump
		if(!Game.customClickLump) Game.customClickLump = [];
		temp = Game.clickLump.toString();
		eval('Game.clickLump = ' + temp.slice(0, -1) + `
			for(var i in Game.customClickLump) Game.customClickLump[i](); 
		` + temp.slice(-1));
		
		
		// Game.harvestLumps
		// I doubt this is useful. The functions get called after the interesting stuff happens
		// TODO make a function that eases adding a lump type
		// Same for Game.computeLumpType. Pointless to make a generic hook
		if(!Game.customHarvestLumps) Game.customHarvestLumps = [];
		temp = Game.harvestLumps.toString();
		eval('Game.harvestLumps = ' + temp.slice(0, -1) + `
			for(var i in Game.customHarvestLumps) Game.customHarvestLumps[i](amount, silent); 
		` + temp.slice(-1));
		
		
		// Game.canLumps
		// Return ret to have no effect
		if(!Game.customCanLumps) Game.customCanLumps = []; 
		CCSE.Backup.canLumps = Game.canLumps;
		Game.canLumps = function(){
			var ret = CCSE.Backup.canLumps();
			for(var i in Game.customCanLumps) ret = Game.customCanLumps[i](ret);
			return ret;
		}
		
		
		// Game.getLumpRefillMax
		// Return ret to have no effect
		if(!Game.customLumpRefillMax) Game.customLumpRefillMax = []; 
		CCSE.Backup.getLumpRefillMax = Game.getLumpRefillMax;
		Game.getLumpRefillMax = function(){
			var ret = CCSE.Backup.getLumpRefillMax();
			for(var i in Game.customLumpRefillMax) ret = Game.customLumpRefillMax[i](ret);
			return ret;
		}
		
		
		// Game.doLumps
		// Runs every logic frame when lumps matter
		if(!Game.customDoLumps) Game.customDoLumps = [];
		temp = Game.doLumps.toString();
		eval('Game.doLumps = ' + temp.slice(0, -1) + `
			for(var i in Game.customDoLumps) Game.customDoLumps[i](); 
		` + temp.slice(-1));
		
		
		// -----     Economics block     ----- //
		
		// Game.CalculateGains
		// I really think this is what he meant it to be
		// The original just has Game.customCps doing the same thing as Game.customCpsMult
		//eval('Game.CalculateGains = ' + Game.CalculateGains.toString().replace(
		//	'for (var i in Game.customCps) {mult*=Game.customCps[i]();}', 
		//	'for (var i in Game.customCps) {Game.cookiesPs += Game.customCps[i]();}'));
		
		
		// Game.dropRateMult
		// Return 1 to have no effect
		if(!Game.customDropRateMult) Game.customDropRateMult = []; 
		CCSE.Backup.dropRateMult = Game.dropRateMult;
		Game.dropRateMult = function(){
			var ret = CCSE.Backup.dropRateMult();
			for(var i in Game.customDropRateMult) ret *= Game.customDropRateMult[i]();
			return ret;
		}
		
		
		// -----     Shimmers block     ----- //
		
		// Game.shimmer
		// Runs when a shimmer (Golden cookie or reindeer) gets created
		// You can push a function that pops it immediately, but it will mess up any FtHoF predictor you use
		if(!Game.customShimmer) Game.customShimmer = [];
		temp = Game.shimmer.toString();
		proto = Game.shimmer.prototype;
		eval('Game.shimmer = ' + temp.slice(0, -1) + `
			for(var i in Game.customShimmer) Game.customShimmer[i](this); 
		` + temp.slice(-1));
		Game.shimmer.prototype = proto;
		
		
		// Game.updateShimmers
		// Runs every logic frame when shimmers matter
		if(!Game.customUpdateShimmers) Game.customUpdateShimmers = [];
		temp = Game.updateShimmers.toString();
		eval('Game.updateShimmers = ' + temp.slice(0, -1) + `
			for(var i in Game.customUpdateShimmers) Game.customUpdateShimmers[i](); 
		` + temp.slice(-1));
		
		
		// Game.killShimmers
		// Runs when we want to remove all shimmers
		if(!Game.customKillShimmers) Game.customKillShimmers = [];
		temp = Game.killShimmers.toString();
		eval('Game.killShimmers = ' + temp.slice(0, -1) + `
			for(var i in Game.customKillShimmers) Game.customKillShimmers[i](); 
		` + temp.slice(-1));
		
		
		// Game.shimmerTypes
		if(!Game.customShimmerTypesAll) Game.customShimmerTypesAll = {};
		
		if(!Game.customShimmerTypesAll.initFunc) Game.customShimmerTypesAll.initFunc = [];
		CCSE.customShimmerTypesAllinitFunc = function(){
			for(var i in Game.customShimmerTypesAll.initFunc) Game.customShimmerTypesAll.initFunc[i]();
		}
		
		if(!Game.customShimmerTypesAll.durationMult) Game.customShimmerTypesAll.durationMult = [];
		CCSE.customShimmerTypesAlldurationMult = function(){
			var dur = 1;
			for(var i in Game.customShimmerTypesAll.durationMult) dur *= Game.customShimmerTypesAll.durationMult[i]();
			return dur;
		}
		
		if(!Game.customShimmerTypesAll.updateFunc) Game.customShimmerTypesAll.updateFunc = [];
		CCSE.customShimmerTypesAllupdateFunc = function(){
			for(var i in Game.customShimmerTypesAll.updateFunc) Game.customShimmerTypesAll.updateFunc[i]();
		}
		
		if(!Game.customShimmerTypesAll.popFunc) Game.customShimmerTypesAll.popFunc = [];
		CCSE.customShimmerTypesAllpopFunc = function(){
			for(var i in Game.customShimmerTypesAll.popFunc) Game.customShimmerTypesAll.popFunc[i]();
		}
		
		if(!Game.customShimmerTypesAll.spawnConditions) Game.customShimmerTypesAll.spawnConditions = [];
		CCSE.customShimmerTypesAllspawnConditions = function(ret){
			for(var i in Game.customShimmerTypesAll.spawnConditions) ret = Game.customShimmerTypesAll.spawnConditions[i](ret);
			return ret;
		}
		
		if(!Game.customShimmerTypesAll.getTimeMod) Game.customShimmerTypesAll.getTimeMod = [];
		CCSE.customShimmerTypesAllgetTimeMod = function(me){
			var m = 1;
			for(var i in Game.customShimmerTypesAll.getTimeMod) m *= Game.customShimmerTypesAll.getTimeMod[i](me);
			return m;
		}
		
		
		// In these, "me" refers to the shimmer itself, and "this" to the shimmer's type object
		// I put this in a separate function to call them when a new type is defined
		if(!Game.customShimmerTypes) Game.customShimmerTypes = {};
		CCSE.Backup.customShimmerTypes = {};
		for(var key in Game.shimmerTypes){
			CCSE.ReplaceShimmerType(key);
		}
		
		
		// Game.shimmerTypes['golden'].popFunc
		// customListPush functions should push strings to list
		// customEffectDurMod functions should return a multiplier to the effect's duration
		// customMult functions should return a multiplier to the effect's magnitude (for Lucky, Chain Cookie, and Cookie Storm drops)
		if(!Game.customShimmerTypes['golden'].customListPush) Game.customShimmerTypes['golden'].customListPush = [];
		if(!Game.customShimmerTypes['golden'].customEffectDurMod) Game.customShimmerTypes['golden'].customEffectDurMod = [];
		if(!Game.customShimmerTypes['golden'].customMult) Game.customShimmerTypes['golden'].customMult = [];
		temp = Game.shimmerTypes['golden'].popFunc.toString();
		eval("Game.shimmerTypes['golden'].popFunc = " + temp.replace('var list=[];', `var list=[];
					for(var i in Game.customShimmerTypes['golden'].customListPush) Game.customShimmerTypes['golden'].customListPush[i](me, list);`
			).replace('var buff=0;', `var buff=0;
					for(var i in Game.customShimmerTypes['golden'].customEffectDurMod) effectDurMod *= Game.customShimmerTypes['golden'].customEffectDurMod[i](me);
					for(var i in Game.customShimmerTypes['golden'].customMult) mult *= Game.customShimmerTypes['golden'].customMult[i](me);`));
		
		
		// Game.shimmerTypes['reindeer'].popFunc
		// customDropRateMult should return a multiplier to the fail rate for reindeer drops
		// Game.customDropRateMult is already taken into account. This is for reindeer specific fucntions
		// Return 1 to have no effect. Return 0 for a guarantee*
		if(!Game.customShimmerTypes['reindeer'].customDropRateMult) Game.customShimmerTypes['reindeer'].customDropRateMult = [];
		temp = Game.shimmerTypes['reindeer'].popFunc.toString();
		eval("Game.shimmerTypes['reindeer'].popFunc = " + temp.replace('if (Math.random()>failRate)', 
					`for(var i in Game.customShimmerTypes['reindeer'].customDropRateMult) failRate *= Game.customShimmerTypes['reindeer'].customDropRateMult[i](me);
					if (Math.random()>failRate)`
			));
		
		
		// -----     Particles block       ----- //
		// -----     Notifications block   ----- //
		// -----     Prompts block         ----- //
		// -----     Menu block            ----- //
		// These start to get into the basic appearance of the game, and stray away from the gameplay itself
		// If someone has an idea they want to try that requires hooks into these functions, I can add them then
		
		
		// -----     Buildings block     ----- //
		if(!Game.customBuildingsAll) Game.customBuildingsAll = {};
		
		if(!Game.customBuildingsAll.switchMinigame) Game.customBuildingsAll.switchMinigame = [];
		CCSE.customBuildingsAllswitchMinigame = function(obj, on){
			for(var i in Game.customBuildingsAll.switchMinigame) Game.customBuildingsAll.switchMinigame[i](obj, on);
		}
		
		if(!Game.customBuildingsAll.getSellMultiplier) Game.customBuildingsAll.getSellMultiplier = [];
		CCSE.customBuildingsAllgetSellMultiplier = function(obj, giveBack){
			for(var i in Game.customBuildingsAll.getSellMultiplier) giveBack = Game.customBuildingsAll.getSellMultiplier[i](obj, giveBack);
			return giveBack;
		}
		
		if(!Game.customBuildingsAll.buy) Game.customBuildingsAll.buy = [];
		CCSE.customBuildingsAllbuy = function(obj, amount){
			for(var i in Game.customBuildingsAll.buy) Game.customBuildingsAll.buy[i](obj, amount);
		}
		
		if(!Game.customBuildingsAll.sell) Game.customBuildingsAll.sell = [];
		CCSE.customBuildingsAllsell = function(obj, amount, bypass){
			for(var i in Game.customBuildingsAll.sell) Game.customBuildingsAll.sell[i](obj, amount, bypass);
		}
		
		if(!Game.customBuildingsAll.sacrifice) Game.customBuildingsAll.sacrifice = [];
		CCSE.customBuildingsAllsacrifice = function(obj, amount){
			for(var i in Game.customBuildingsAll.sacrifice) Game.customBuildingsAll.sacrifice[i](obj, amount);
		}
		
		if(!Game.customBuildingsAll.buyFree) Game.customBuildingsAll.buyFree = [];
		CCSE.customBuildingsAllbuyFree = function(obj, amount){
			for(var i in Game.customBuildingsAll.buyFree) Game.customBuildingsAll.buyFree[i](obj, amount);
		}
		
		if(!Game.customBuildingsAll.getFree) Game.customBuildingsAll.getFree = [];
		CCSE.customBuildingsAllgetFree = function(obj, amount){
			for(var i in Game.customBuildingsAll.getFree) Game.customBuildingsAll.getFree[i](obj, amount);
		}
		
		if(!Game.customBuildingsAll.getFreeRanks) Game.customBuildingsAll.getFreeRanks = [];
		CCSE.customBuildingsAllgetFreeRanks = function(obj, amount){
			for(var i in Game.customBuildingsAll.getFreeRanks) Game.customBuildingsAll.getFreeRanks[i](obj, amount);
		}
		
		if(!Game.customBuildingsAll.tooltip) Game.customBuildingsAll.tooltip = [];
		CCSE.customBuildingsAlltooltip = function(obj, ret){
			for(var i in Game.customBuildingsAll.tooltip) ret = Game.customBuildingsAll.tooltip[i](obj, ret);
			return ret;
		}
		
		if(!Game.customBuildingsAll.levelTooltip) Game.customBuildingsAll.levelTooltip = [];
		CCSE.customBuildingsAlllevelTooltip = function(obj, ret){
			for(var i in Game.customBuildingsAll.levelTooltip) ret = Game.customBuildingsAll.levelTooltip[i](obj, ret);
			return ret;
		}
		
		if(!Game.customBuildingsAll.refresh) Game.customBuildingsAll.refresh = [];
		CCSE.customBuildingsAllrefresh = function(obj){
			for(var i in Game.customBuildingsAll.refresh) Game.customBuildingsAll.refresh[i](obj);
		}
		
		if(!Game.customBuildingsAll.rebuild) Game.customBuildingsAll.rebuild = [];
		CCSE.customBuildingsAllrebuild = function(obj){
			for(var i in Game.customBuildingsAll.rebuild) Game.customBuildingsAll.rebuild[i](obj);
		}
		
		if(!Game.customBuildingsAll.mute) Game.customBuildingsAll.mute = [];
		CCSE.customBuildingsAllmute = function(obj, val){
			for(var i in Game.customBuildingsAll.mute) Game.customBuildingsAll.mute[i](obj, val);
		}
		
		if(!Game.customBuildingsAll.draw) Game.customBuildingsAll.draw = [];
		CCSE.customBuildingsAlldraw = function(obj){
			for(var i in Game.customBuildingsAll.draw) Game.customBuildingsAll.draw[i](obj);
		}
		
		if(!Game.customBuildingsAll.buyFunction) Game.customBuildingsAll.buyFunction = [];
		CCSE.customBuildingsAllbuyFunction = function(obj){
			for(var i in Game.customBuildingsAll.buyFunction) Game.customBuildingsAll.buyFunction[i](obj);
		}
		
		if(!Game.customBuildingsAll.cpsMult) Game.customBuildingsAll.cpsMult = [];
		CCSE.customBuildingsAllcpsMult = function(obj){
			var mult = 1;
			for(var i in Game.customBuildingsAll.cpsMult) mult *= Game.customBuildingsAll.cpsMult[i](obj);
			return mult;
		}
		
		
		if(!Game.customBuildings) Game.customBuildings = {};
		CCSE.Backup.customBuildings = {};
		for(var key in Game.Objects){
			CCSE.ReplaceBuilding(key);
		}
		
		
		// Game.DrawBuildings
		// Runs every draw frame if we're not ascending
		if(!Game.customDrawBuildings) Game.customDrawBuildings = [];
		temp = Game.DrawBuildings.toString();
		eval('Game.DrawBuildings = ' + temp.slice(0, -1) + `
			for(var i in Game.customDrawBuildings) Game.customDrawBuildings[i](); 
		` + temp.slice(-1));
		
		
		// Game.modifyBuildingPrice
		// Functions should return a value to multiply the price by
		// Return 1 to have no effect
		if(!Game.customModifyBuildingPrice) Game.customModifyBuildingPrice = [];
		temp = Game.modifyBuildingPrice.toString();
		eval('Game.modifyBuildingPrice = ' + temp.replace('return', `
			for(var i in Game.customModifyBuildingPrice) price *= Game.customModifyBuildingPrice[i](building, price); 
			return`));
		
		
		// Game.storeBulkButton
		if(!Game.customStoreBulkButton) Game.customStoreBulkButton = [];
		temp = Game.storeBulkButton.toString();
		eval('Game.storeBulkButton = ' + temp.slice(0, -1) + `
			for(var i in Game.customStoreBulkButton) Game.customStoreBulkButton[i](); 
		` + temp.slice(-1));
		
		
		// Game.RefreshStore
		if(!Game.customRefreshStore) Game.customRefreshStore = [];
		temp = Game.RefreshStore.toString();
		eval('Game.RefreshStore = ' + temp.slice(0, -1) + `
			for(var i in Game.customRefreshStore) Game.customRefreshStore[i](); 
		` + temp.slice(-1));
		
		
		// Game.scriptLoaded
		if(!Game.customScriptLoaded) Game.customScriptLoaded = [];
		if(!Game.customMinigameOnLoad) Game.customMinigameOnLoad = {};
		for(key in Game.Objects) if(!Game.customMinigameOnLoad[key]) Game.customMinigameOnLoad[key] = [];
		
		temp = Game.scriptLoaded.toString();
		eval('Game.scriptLoaded = ' + temp.slice(0, -1) + `
			for(var i in Game.customScriptLoaded) Game.customScriptLoaded[i](who, script); // Who knows, maybe those arguments might be needed
			for(var i in Game.customMinigameOnLoad[who.name]) Game.customMinigameOnLoad[who.name][i](who, script);
		` + temp.slice(-1));
		
		
		// -----     Individual Buildings block     ----- //
		
		obj = Game.Objects['Cursor'];
		// Cursor.cps
		// cpsAdd Functions should return a value to add per non cursor building (Return 0 to have no effect)
		if(!Game.customBuildings[obj.name].cpsAdd) Game.customBuildings[obj.name].cpsAdd = [];
		if(!Game.customBuildings[obj.name].cpsMult) Game.customBuildings[obj.name].cpsMult = [];
		temp = obj.cps.toString();
		eval('obj.cps = ' + temp.replace('var mult=1;', `
			for(var i in Game.customBuildings['` + obj.name + `'].cpsAdd) add += Game.customBuildings['` + obj.name + `'].cpsAdd[i](me);
			var mult=1;`
		));
		
		
		obj = Game.Objects['Grandma'];
		// Grandma.art.pic
		// Functions should push an image name (sans the .png part) into list
		if(!Game.customGrandmaPicture) Game.customGrandmaPicture = [];
		temp = obj.art.pic.toString();
		eval('obj.art.pic = ' + temp.replace('return', `
			for(var j in Game.customGrandmaPicture) Game.customGrandmaPicture[j](i, list);
			return`));
		
		
		// Grandma.cps
		// cpsAdd Functions should return a value to add before multiplying (Return 0 to have no effect)
		if(!Game.customBuildings[obj.name].cpsAdd) Game.customBuildings[obj.name].cpsAdd = [];
		if(!Game.customBuildings[obj.name].cpsMult) Game.customBuildings[obj.name].cpsMult = [];
		temp = obj.cps.toString();
		eval('obj.cps = ' + temp.replace('return', `
			for(var i in Game.customBuildings['` + obj.name + `'].cpsAdd) add += Game.customBuildings['` + obj.name + `'].cpsAdd[i](me);
			return`));
		
		
		// -----     Upgrades block     ----- //
		if(!Game.customUpgradesAll) Game.customUpgradesAll = {}; 
		
		if(!Game.customUpgradesAll.getPrice) Game.customUpgradesAll.getPrice = [];
		CCSE.customUpgradesAllgetPrice = function(me){
			var ret = 1
			for(var i in Game.customUpgradesAll.getPrice) ret *= Game.customUpgradesAll.getPrice[i](me);
			return ret;
		}
		
		if(!Game.customUpgradesAll.click) Game.customUpgradesAll.click = [];
		CCSE.customUpgradesAllclick = function(me, e){
			for(var i in Game.customUpgradesAll.click) Game.customUpgradesAll.click[i](me, e);
		}
		
		if(!Game.customUpgradesAll.buy) Game.customUpgradesAll.buy = []; 
		CCSE.customUpgradesAllbuy = function(me, bypass, success){
			for(var i in Game.customUpgradesAll.buy) Game.customUpgradesAll.buy[i](me, bypass, success);
		}
		
		if(!Game.customUpgradesAll.earn) Game.customUpgradesAll.earn = [];
		CCSE.customUpgradesAllearn = function(me){
			for(var i in Game.customUpgradesAll.earn) Game.customUpgradesAll.earn[i](me);
		}
		
		if(!Game.customUpgradesAll.unearn) Game.customUpgradesAll.unearn = [];
		CCSE.customUpgradesAllunearn = function(me){
			for(var i in Game.customUpgradesAll.unearn) Game.customUpgradesAll.unearn[i](me);
		}
		
		if(!Game.customUpgradesAll.unlock) Game.customUpgradesAll.unlock = [];
		CCSE.customUpgradesAllunlock = function(me){
			for(var i in Game.customUpgradesAll.unlock) Game.customUpgradesAll.unlock[i](me);
		}
		
		if(!Game.customUpgradesAll.lose) Game.customUpgradesAll.lose = [];
		CCSE.customUpgradesAlllose = function(me){
			for(var i in Game.customUpgradesAll.lose) Game.customUpgradesAll.lose[i](me);
		}
		
		if(!Game.customUpgradesAll.toggle) Game.customUpgradesAll.toggle = [];
		CCSE.customUpgradesAlltoggle = function(me){
			for(var i in Game.customUpgradesAll.toggle) Game.customUpgradesAll.toggle[i](me);
		}
		
		if(!Game.customUpgradesAll.buyFunction) Game.customUpgradesAll.buyFunction = [];
		CCSE.customUpgradesAllbuyFunction = function(me){
			for(var i in Game.customUpgradesAll.buyFunction) Game.customUpgradesAll.buyFunction[i](me);
		}
		
		if(!Game.customUpgradesAll.descFunc)	Game.customUpgradesAll.descFunc = [];
		CCSE.customUpgradesAlldescFunc = function(me, desc){
			for(var i in Game.customUpgradesAll.descFunc) desc = Game.customUpgradesAll.descFunc[i](me, desc);
			return desc;
		}
		
		
		if(!Game.customUpgrades) Game.customUpgrades = {};
		CCSE.Backup.customUpgrades = {};
		for(var key in Game.Upgrades){
			CCSE.ReplaceUpgrade(key);
		}
		
		
		// Correct these descFuncs
		var slots=['Permanent upgrade slot I','Permanent upgrade slot II','Permanent upgrade slot III','Permanent upgrade slot IV','Permanent upgrade slot V'];
		for (var i=0;i<slots.length;i++)
		{
			CCSE.Backup.customUpgrades[slots[i]].descFunc=function(i){return function(){
				if (Game.permanentUpgrades[i]==-1) return Game.Upgrades[slots[i]].desc;
				var upgrade=Game.UpgradesById[Game.permanentUpgrades[i]];
				return '<div style="text-align:center;">'+'Current : <div class="icon" style="vertical-align:middle;display:inline-block;'+(upgrade.icon[2]?'background-image:url('+upgrade.icon[2]+');':'')+'background-position:'+(-upgrade.icon[0]*48)+'px '+(-upgrade.icon[1]*48)+'px;transform:scale(0.5);margin:-16px;"></div> <b>'+upgrade.name+'</b><div class="line"></div></div>'+Game.Upgrades[slots[i]].desc;
			};}(i);
		}
		
		
		// Game.storeBuyAll
		if(!Game.customStoreBuyAll) Game.customStoreBuyAll = [];
		temp = Game.storeBuyAll.toString();
		eval('Game.storeBuyAll = ' + temp.slice(0, -1) + `
			for(var i in Game.customStoreBuyAll) Game.customStoreBuyAll[i](); 
		` + temp.slice(-1));
		
		
		// Game.CountsAsUpgradeOwned
		// Return ret to have no effect
		if(!Game.customCountsAsUpgradeOwned) Game.customCountsAsUpgradeOwned = []; 
		CCSE.Backup.CountsAsUpgradeOwned =  Game.CountsAsUpgradeOwned;
		Game.CountsAsUpgradeOwned = function(pool){
			var ret = CCSE.Backup.CountsAsUpgradeOwned(pool);
			for(var i in Game.customCountsAsUpgradeOwned) ret = Game.customCountsAsUpgradeOwned[i](pool, ret);
			return ret;
		}
		
		
		// Game.Unlock
		if(!Game.customUnlock) Game.customUnlock = [];
		temp = Game.Unlock.toString();
		eval('Game.Unlock = ' + temp.slice(0, -1) + `
			for(var i in Game.customUnlock) Game.customUnlock[i](what); 
		` + temp.slice(-1));
		
		
		// Game.Lock
		if(!Game.customLock) Game.customLock = [];
		temp = Game.Lock.toString();
		eval('Game.Lock = ' + temp.slice(0, -1) + `
			for(var i in Game.customLock) Game.customLock[i](what); 
		` + temp.slice(-1));
		
		
		// Game.RebuildUpgrades
		if(!Game.customRebuildUpgrades) Game.customRebuildUpgrades = [];
		temp = Game.RebuildUpgrades.toString();
		eval('Game.RebuildUpgrades = ' + temp.slice(0, -1) + `
			for(var i in Game.customRebuildUpgrades) Game.customRebuildUpgrades[i](); 
		` + temp.slice(-1));
		
		
		// Game.GetTieredCpsMult
		// Functions should return a value to multiply mult by (Return 1 to have no effect)
		if(!Game.customGetTieredCpsMult) Game.customGetTieredCpsMult = [];
		temp = Game.GetTieredCpsMult.toString();
		eval('Game.GetTieredCpsMult = ' + temp.replace('return', `
			for(var i in Game.customGetTieredCpsMult) mult *= Game.customGetTieredCpsMult[i](me);
			return`));
		
		
		// Game.UnlockTiered
		if(!Game.customUnlockTiered) Game.customUnlockTiered = [];
		temp = Game.UnlockTiered.toString();
		eval('Game.UnlockTiered = ' + temp.slice(0, -1) + `
			for(var i in Game.customUnlockTiered) Game.customUnlockTiered[i](me); 
		` + temp.slice(-1));
		
		
		// Game.SetResearch
		if(!Game.customSetResearch) Game.customSetResearch = [];
		temp = Game.SetResearch.toString();
		eval('Game.SetResearch = ' + temp.slice(0, -1) + `
			for(var i in Game.customSetResearch) Game.customSetResearch[i](what, time); 
		` + temp.slice(-1));
		
		
		// Game.DropEgg
		// Functions should return a value to multiply failRate by (Return 1 to have no effect)
		if(!Game.customDropEgg) Game.customDropEgg = [];
		temp = Game.DropEgg.toString();
		eval('Game.DropEgg = ' + temp.replace('{', `{
			for(var i in Game.customDropEgg) failRate *= Game.customDropEgg[i]();`));
		
		
		// Game.AssignPermanentSlot
		// Don't know where to put the hook. If you have a good idea, let me know.
		
		
		// Game.PutUpgradeInPermanentSlot
		if(!Game.customPutUpgradeInPermanentSlot) Game.customPutUpgradeInPermanentSlot = [];
		temp = Game.PutUpgradeInPermanentSlot.toString();
		eval('Game.PutUpgradeInPermanentSlot = ' + temp.slice(0, -1) + `
			for(var i in Game.customPutUpgradeInPermanentSlot) Game.customPutUpgradeInPermanentSlot[i](upgrade, slot); 
		` + temp.slice(-1));
		
		
		// Game.loseShimmeringVeil
		if(!Game.customLoseShimmeringVeil) Game.customLoseShimmeringVeil = [];
		temp = Game.loseShimmeringVeil.toString();
		eval('Game.loseShimmeringVeil = ' + temp.slice(0, -1) + `
			for(var i in Game.customLoseShimmeringVeil) Game.customLoseShimmeringVeil[i](context); 
		` + temp.slice(-1));
		
		
		// Game.listTinyOwnedUpgrades
		if(!Game.customListTinyOwnedUpgrades) Game.customListTinyOwnedUpgrades = [];
		temp = Game.listTinyOwnedUpgrades.toString();
		eval('Game.listTinyOwnedUpgrades = ' + temp.replace('return', `
			for(var i in Game.customListTinyOwnedUpgrades) str = Game.customListTinyOwnedUpgrades[i](arr, str);
			return`));
		
		
		// -----     Seasons block     ----- //
		
		// Game.computeSeasons
		temp = Game.computeSeasons.toString();
		eval('Game.computeSeasons = ' + temp.replace("else Game.Notify(str,'',this.icon,4);", `else Game.Notify(str,'',this.icon,4);
				for(var i in Game.customUpgrades[this.name].buyFunction) Game.customUpgrades[this.name].buyFunction[i](this);`));
		
		
		// Game.getSeasonDuration
		// Functions should return a multiplier to the season duration
		// Return 1 to have no effect
		if(!Game.customGetSeasonDuration) Game.customGetSeasonDuration = []; 
		CCSE.Backup.getSeasonDuration = Game.getSeasonDuration;
		Game.getSeasonDuration = function(pool){
			var ret = CCSE.Backup.getSeasonDuration();
			for(var i in Game.customGetSeasonDuration) ret *= Game.customGetSeasonDuration[i]();
			return ret;
		}
		
		
		// -----     Achievements block     ----- //
		if(!Game.customAchievementsAll) Game.customAchievementsAll = {};
		
		if(!Game.customAchievementsAll.click) Game.customAchievementsAll.click = [];
		CCSE.customAchievementsAllclick = function(me){
			for(var i in Game.customAchievementsAll.click) Game.customAchievementsAll.click[i](me);
		}
	
	
		if(!Game.customAchievements) Game.customAchievements = {};
		CCSE.Backup.customAchievements = {};
		for(var key in Game.Achievements){
			CCSE.ReplaceAchievement(key);
		}
		
		
		// Game.Win
		if(!Game.customWin) Game.customWin = [];
		temp = Game.Win.toString();
		eval('Game.Win = ' + temp.slice(0, -1) + `
			for(var i in Game.customWin) Game.customWin[i](what); 
		` + temp.slice(-1));
		
		
		// -----     Buffs block     ----- //
		
		// Game.gainBuff
		if(!Game.customGainBuff) Game.customGainBuff = [];
		temp = Game.gainBuff.toString();
		eval('Game.gainBuff = ' + temp.replace('return', `
			for(var i in Game.customGainBuff) Game.customGainBuff[i](buff);
			return`));
		
		
		// Game.updateBuffs
		// executed every logic frame
		if(!Game.customUpdateBuffs) Game.customUpdateBuffs = [];
		temp = Game.updateBuffs.toString();
		eval('Game.updateBuffs = ' + temp.slice(0, -1) + `
			for(var i in Game.customUpdateBuffs) Game.customUpdateBuffs[i](); 
		` + temp.slice(-1));
		
		
		// -----     GRANDMAPOCALYPSE block     ----- //
		
		// I need this because this gets used once and if I leave it out the game breaks
		function inRect(x,y,rect)
		{
			//find out if the point x,y is in the rotated rectangle rect{w,h,r,o} (width,height,rotation in radians,y-origin) (needs to be normalized)
			//I found this somewhere online I guess
			var dx = x+Math.sin(-rect.r)*(-(rect.h/2-rect.o)),dy=y+Math.cos(-rect.r)*(-(rect.h/2-rect.o));
			var h1 = Math.sqrt(dx*dx + dy*dy);
			var currA = Math.atan2(dy,dx);
			var newA = currA - rect.r;
			var x2 = Math.cos(newA) * h1;
			var y2 = Math.sin(newA) * h1;
			if (x2 > -0.5 * rect.w && x2 < 0.5 * rect.w && y2 > -0.5 * rect.h && y2 < 0.5 * rect.h) return true;
			return false;
		}
		
		// Game.UpdateGrandmapocalypse
		// executed every logic frame
		if(!Game.customUpdateGrandmapocalypse) Game.customUpdateGrandmapocalypse = [];
		temp = Game.UpdateGrandmapocalypse.toString();
		eval('Game.UpdateGrandmapocalypse = ' + temp.slice(0, -1) + `
			for(var i in Game.customUpdateGrandmapocalypse) Game.customUpdateGrandmapocalypse[i](); 
		` + temp.slice(-1));
		
		
		// Game.getWrinklersMax
		// Functions should return a value to add to n. Return 0 to have no effect
		if(!Game.customGetWrinklersMax) Game.customGetWrinklersMax = [];
		temp = Game.getWrinklersMax.toString();
		eval('Game.getWrinklersMax = ' + temp.replace('return', `
			for(var i in Game.customGetWrinklersMax) n += Game.customGetWrinklersMax[i](n);
			return`));
		
		
		// Game.SpawnWrinkler
		if(!Game.customSpawnWrinkler) Game.customSpawnWrinkler = [];
		temp = Game.SpawnWrinkler.toString();
		eval('Game.SpawnWrinkler = ' + temp.replace('return me', `
			for(var i in Game.customSpawnWrinkler) Game.customSpawnWrinkler[i](me);
			return me`));
		
		
		// Game.UpdateWrinklers
		// customWrinklerSpawnChance functions should return a multiplier to chance. (Return 1 to have no effect)
		if(!Game.customUpdateWrinklers) Game.customUpdateWrinklers = [];
		if(!Game.customWrinklerSpawnChance) Game.customWrinklerSpawnChance = [];
		if(!Game.customWrinklerPop) Game.customWrinklerPop = [];
		temp = Game.UpdateWrinklers.toString();
		eval('Game.UpdateWrinklers = ' + temp.replace('if (Math.random()<chance)', `
					for(var i in Game.customWrinklerSpawnChance) chance *= Game.customWrinklerSpawnChance[i]();
					if (Math.random()<chance)`).replace('Game.Earn(me.sucked);', `
					for(var i in Game.customWrinklerPop) Game.customWrinklerPop[i](me);
					Game.Earn(me.sucked);`).slice(0, -1) + `
			for(var i in Game.customUpdateWrinklers) Game.customUpdateWrinklers[i](); 
		` + temp.slice(-1));
		
		
		// Game.DrawWrinklers
		if(!Game.customDrawWrinklers) Game.customDrawWrinklers = [];
		temp = Game.DrawWrinklers.toString();
		eval('Game.DrawWrinklers = ' + temp.slice(0, -1) + `
			for(var i in Game.customDrawWrinklers) Game.customDrawWrinklers[i](); 
		` + temp.slice(-1));
		
		
		// Game.SaveWrinklers
		// Return ret to have no effect
		if(!Game.customSaveWrinklers) Game.customSaveWrinklers = [];
		CCSE.Backup.SaveWrinklers = Game.SaveWrinklers;
		Game.SaveWrinklers = function(){
			var ret = CCSE.Backup.SaveWrinklers();
			for(var i in Game.customSaveWrinklers) ret = Game.customSaveWrinklers[i](ret);
			return ret;
		}
		
		
		// Game.LoadWrinklers
		if(!Game.customLoadWrinklers) Game.customLoadWrinklers = [];
		temp = Game.LoadWrinklers.toString();
		eval('Game.LoadWrinklers = ' + temp.slice(0, -1) + `
			for(var i in Game.customLoadWrinklers) Game.customLoadWrinklers[i](amount, number, shinies, amountShinies); 
		` + temp.slice(-1));
		
		
		// -----     Special things and stuff block     ----- //
		
		// Game.UpdateSpecial
		// customSpecialTabs functions should push a string to Game.specialTabs (or not)
		if(!Game.customSpecialTabs) Game.customSpecialTabs = [];
		temp = Game.UpdateSpecial.toString();
		eval('Game.UpdateSpecial = ' + temp.replace('if (Game.specialTabs.length==0)', 
			`for(var i in Game.customSpecialTabs) Game.customSpecialTabs[i]();
			if (Game.specialTabs.length==0)`));
		
		
		// Game.UpgradeSanta
		if(!Game.customUpgradeSanta) Game.customUpgradeSanta = [];
		temp = Game.UpgradeSanta.toString();
		eval('Game.UpgradeSanta = ' + temp.slice(0, -1) + `
			for(var i in Game.customUpgradeSanta) Game.customUpgradeSanta[i](); 
		` + temp.slice(-1));
		
		
		// Game.hasAura
		// Return ret to have no effect
		if(!Game.customHasAura) Game.customHasAura = [];
		CCSE.Backup.hasAura = Game.hasAura;
		Game.hasAura = function(what){
			var ret = CCSE.Backup.hasAura(what);
			for(var i in Game.customHasAura) ret = Game.customHasAura[i](what, ret);
			return ret;
		}
		
		
		// Game.SelectDragonAura
		// Actually no. This function is not conducive to customization. Seems like 2 auras is all we get.
		// customCurrentDragonAura functions should return an array index for currentAura (Return currentAura to do nothing)
		// customDragonAuraShow functions should return 1 to show that aura in the picker, 0 to not (Return show to do nothing)
		/*if(!Game.customCurrentDragonAura) Game.customCurrentDragonAura = [];
		if(!Game.customDragonAuraShow) Game.customDragonAuraShow = [];
		temp = Game.SelectDragonAura.toString();
		eval('Game.SelectDragonAura = ' + temp.replace('if (!update)', 
			`for(var i in Game.customCurrentDragonAura) currentAura = Game.customCurrentDragonAura[i](slot, update, currentAura);
			if (!update)`).replace('if (i==0 || i!=otherAura)', 
					`var show = (i==0 || i!=otherAura);
					for(var i in Game.customDragonAuraShow) show = Game.customDragonAuraShow[i](slot, update, i, show);
					if (show)`));*/
		
		
		// Game.DescribeDragonAura
		if(!Game.customDescribeDragonAura) Game.customDescribeDragonAura = [];
		temp = Game.DescribeDragonAura.toString();
		eval('Game.DescribeDragonAura = ' + temp.slice(0, -1) + `
			for(var i in Game.customDescribeDragonAura) Game.customDescribeDragonAura[i](); 
		` + temp.slice(-1));
		
		
		// Game.UpgradeDragon
		if(!Game.customUpgradeDragon) Game.customUpgradeDragon = [];
		temp = Game.UpgradeDragon.toString();
		eval('Game.UpgradeDragon = ' + temp.slice(0, -1) + `
			for(var i in Game.customUpgradeDragon) Game.customUpgradeDragon[i](); 
		` + temp.slice(-1));
		
		
		// Game.ToggleSpecialMenu
		// customToggleSpecialMenu functions should return a string for l('specialPopup').innerHTML (Return str for no effect)
		// str.replace('background:url(img/dragon.png?v='+Game.version+');background-position:-384px 0px;', <your pic here>)
		// Pics are 96px by 96px
		if(!Game.customToggleSpecialMenu) Game.customToggleSpecialMenu = [];
		temp = Game.ToggleSpecialMenu.toString();
		eval('Game.ToggleSpecialMenu = ' + temp.replace("l('specialPopup').innerHTML=str;", 
				`for(var i in Game.customToggleSpecialMenu) str = Game.customToggleSpecialMenu[i](str);
				l('specialPopup').innerHTML=str;`));
		
		
		// Game.DrawSpecial
		// customDrawSpecialPic functions should alter the picframe object
		// Pics are 96px by 96px
		if(!Game.customDrawSpecial) Game.customDrawSpecial = [];
		if(!Game.customDrawSpecialPic) Game.customDrawSpecialPic = [];
		temp = Game.DrawSpecial.toString();
		eval('Game.DrawSpecial = ' + temp.replace("if (hovered || selected)", 
				`var picframe = {pic:pic, frame:frame};
				for(var j in Game.customDrawSpecialPic) Game.customDrawSpecialPic[j](picframe, Game.specialTabs[i]);
				pic = picframe.pic; frame = picframe.frame;
				if (hovered || selected)`).slice(0, -1) + `
			for(var i in Game.customDrawSpecial) Game.customDrawSpecial[i](); 
		` + temp.slice(-1));
		
		
		// -----     Visual Effects block     ----- //
		
		// Game.DrawBackground
		// Game.customDrawBackground functions get called in the same block that creates the cookie rain and seasonal backgrounds 
		// If you want a hook somewhere else, let me know
		if(!Game.customDrawBackground) Game.customDrawBackground = [];
		temp = Game.DrawBackground.toString();
		eval('Game.DrawBackground = ' + temp.replace("Timer.track('left background');", 
				`for(var i in Game.customDrawBackground) Game.customDrawBackground[i]();
				Timer.track('left background');`));
		
		
		// -----     Debug block     ----- //
		
		// Game.OpenSesame
		// Game.customOpenSesame functions should add HTML strings to the debug menu
		if(!Game.customOpenSesame) Game.customOpenSesame = [];
		temp = Game.OpenSesame.toString();
		eval('Game.OpenSesame = ' + temp.replace("str+='</div>';", 
				`for(var i in Game.customOpenSesame) str += Game.customOpenSesame[i]();
				str+='</div>';`));
		
		
	}
	
	CCSE.ReplaceShimmerType = function(key){
		var temp = '';
		var pos = 0;
		var proto;
		var escKey = key.replace(/'/g, "\\'");
		
		if(!Game.customShimmerTypes[key]) Game.customShimmerTypes[key] = {};
		CCSE.Backup.customShimmerTypes[key] = {};
		
		
		// Game.shimmerTypes[key].initFunc
		// durationMult functions should return a value to multiply the duration by
		if(!Game.customShimmerTypes[key].initFunc) Game.customShimmerTypes[key].initFunc = [];
		if(!Game.customShimmerTypes[key].durationMult) Game.customShimmerTypes[key].durationMult = [];
		Game.customShimmerTypes[key].initFunc.push(CCSE.customShimmerTypesAllinitFunc);
		Game.customShimmerTypes[key].durationMult.push(CCSE.customShimmerTypesAlldurationMult);
		temp = Game.shimmerTypes[key].initFunc.toString();
		eval('Game.shimmerTypes[key].initFunc = ' + temp.slice(0, -1).replace(
			'me.dur=dur;', `for(var i in Game.customShimmerTypes['` + escKey + `'].durationMult) dur *= Game.customShimmerTypes['` + escKey + `'].durationMult[i](); 
					me.dur=dur;`) + `
					for(var i in Game.customShimmerTypes['` + escKey + `'].initFunc) Game.customShimmerTypes['` + escKey + `'].initFunc[i]();
				` + temp.slice(-1));
		
		
		// Game.shimmerTypes[key].updateFunc
		if(!Game.customShimmerTypes[key].updateFunc) Game.customShimmerTypes[key].updateFunc = [];
		Game.customShimmerTypes[key].updateFunc.push(CCSE.customShimmerTypesAllupdateFunc);
		temp = Game.shimmerTypes[key].updateFunc.toString();
		eval('Game.shimmerTypes[key].updateFunc = ' + temp.slice(0, -1) + `
					for(var i in Game.customShimmerTypes['` + escKey + `'].updateFunc) Game.customShimmerTypes['` + escKey + `'].updateFunc[i](); 
				` + temp.slice(-1));
		
		
		// Game.shimmerTypes[key].popFunc
		if(!Game.customShimmerTypes[key].popFunc) Game.customShimmerTypes[key].popFunc = [];
		Game.customShimmerTypes[key].popFunc.push(CCSE.customShimmerTypesAllpopFunc);
		temp = Game.shimmerTypes[key].popFunc.toString();
		eval('Game.shimmerTypes[key].popFunc = ' + temp.slice(0, -1) + `
					for(var i in Game.customShimmerTypes['` + escKey + `'].popFunc) Game.customShimmerTypes['` + escKey + `'].popFunc[i](); 
				` + temp.slice(-1));
		
		
		// Game.shimmerTypes[key].spawnConditions
		// Return ret to have no effect 
		if(!Game.customShimmerTypes[key].spawnConditions) Game.customShimmerTypes[key].spawnConditions = [];
		Game.customShimmerTypes[key].spawnConditions.push(CCSE.customShimmerTypesAllspawnConditions);
		CCSE.Backup.customShimmerTypes[key].spawnConditions = Game.shimmerTypes[key].spawnConditions;
		eval(`Game.shimmerTypes['` + escKey + `'].spawnConditions = function(){
				var ret = CCSE.Backup.customShimmerTypes['` + escKey + `'].spawnConditions();
				for(var i in Game.customShimmerTypes['` + escKey + `'].spawnConditions) ret = Game.customShimmerTypes['` + escKey + `'].spawnConditions[i](ret);
				return ret;
			}`);
		
		
		// Game.shimmerTypes[key].getTimeMod
		// Functions should return a multiplier to the shimmer's spawn time (higher takes longer to spawn)
		// Return 1 to have no effect 
		// These run at the top of the function, before the vanilla code
		if(!Game.customShimmerTypes[key].getTimeMod) Game.customShimmerTypes[key].getTimeMod = [];
		Game.customShimmerTypes[key].getTimeMod.push(CCSE.customShimmerTypesAllgetTimeMod);
		temp = Game.shimmerTypes[key].getTimeMod.toString();
		eval('Game.shimmerTypes[key].getTimeMod = ' + temp.replace('{', `{
					for(var i in Game.customShimmerTypes['` + escKey + `'].getTimeMod) m *= Game.customShimmerTypes['` + escKey + `'].getTimeMod[i](me);`));
	}
	
	CCSE.ReplaceBuilding = function(key){
		// A lot of Copy/Paste happened, hence why I did so many functions.
		// Also, I may not have fully tested each one.
		var temp = '';
		var pos = 0;
		var proto;
		var escKey = key.replace(/'/g, "\\'");
		var obj = Game.Objects[key];
		
		if(!Game.customBuildings[key]) Game.customBuildings[key] = {};
		CCSE.Backup.customBuildings[key] = {};
		
		
		// this.switchMinigame
		if(!Game.customBuildings[key].switchMinigame) Game.customBuildings[key].switchMinigame = [];
		Game.customBuildings[key].switchMinigame.push(CCSE.customBuildingsAllswitchMinigame);
		temp = obj.switchMinigame.toString();
		eval('obj.switchMinigame = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings[this.name].switchMinigame) Game.customBuildings[this.name].switchMinigame[i](this, on); 
			` + temp.slice(-1));
		
		
		// this.getSellMultiplier
		// Return ret to have no effect
		if(!Game.customBuildings[key].getSellMultiplier) Game.customBuildings[key].getSellMultiplier = [];
		Game.customBuildings[key].getSellMultiplier.push(CCSE.customBuildingsAllgetSellMultiplier);
		temp = obj.getSellMultiplier.toString();
		eval('obj.getSellMultiplier = ' + temp.replace('return', `
				for(var i in Game.customBuildings[this.name].getSellMultiplier) giveBack = Game.customBuildings[this.name].getSellMultiplier[i](this, giveBack); 
				return`));
		
		
		// this.buy
		if(!Game.customBuildings[key].buy) Game.customBuildings[key].buy = [];
		Game.customBuildings[key].buy.push(CCSE.customBuildingsAllbuy);
		temp = obj.buy.toString();
		eval('obj.buy = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings[this.name].buy) Game.customBuildings[this.name].buy[i](this, amount); 
			` + temp.slice(-1));
		
		
		// this.sell
		if(!Game.customBuildings[key].sell) Game.customBuildings[key].sell = [];
		Game.customBuildings[key].sell.push(CCSE.customBuildingsAllsell);
		temp = obj.sell.toString();
		eval('obj.sell = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings[this.name].sell) Game.customBuildings[this.name].sell[i](this, amount, bypass); 
			` + temp.slice(-1));
		
		
		// this.sacrifice
		if(!Game.customBuildings[key].sacrifice) Game.customBuildings[key].sacrifice = [];
		Game.customBuildings[key].sacrifice.push(CCSE.customBuildingsAllsacrifice);
		temp = obj.sacrifice.toString();
		eval('obj.sacrifice = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings[this.name].sacrifice) Game.customBuildings[this.name].sacrifice[i](this, amount); 
			` + temp.slice(-1));
		
		
		// this.buyFree
		if(!Game.customBuildings[key].buyFree) Game.customBuildings[key].buyFree = [];
		Game.customBuildings[key].buyFree.push(CCSE.customBuildingsAllbuyFree);
		temp = obj.buyFree.toString();
		eval('obj.buyFree = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings[this.name].buyFree) Game.customBuildings[this.name].buyFree[i](this, amount); 
			` + temp.slice(-1));
		
		
		// this.getFree
		if(!Game.customBuildings[key].getFree) Game.customBuildings[key].getFree = [];
		Game.customBuildings[key].getFree.push(CCSE.customBuildingsAllgetFree);
		temp = obj.getFree.toString();
		eval('obj.getFree = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings[this.name].getFree) Game.customBuildings[this.name].getFree[i](this, amount); 
			` + temp.slice(-1));
		
		
		// this.getFreeRanks
		if(!Game.customBuildings[key].getFreeRanks) Game.customBuildings[key].getFreeRanks = [];
		Game.customBuildings[key].getFreeRanks.push(CCSE.customBuildingsAllgetFreeRanks);
		temp = obj.getFreeRanks.toString();
		eval('obj.getFreeRanks = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings[this.name].getFreeRanks) Game.customBuildings[this.name].getFreeRanks[i](this, amount); 
			` + temp.slice(-1));
		
		
		// this.tooltip
		// Return ret to have no effect
		if(!Game.customBuildings[key].tooltip) Game.customBuildings[key].tooltip = []; 
		Game.customBuildings[key].tooltip.push(CCSE.customBuildingsAlltooltip);
		eval('CCSE.Backup.customBuildings[key].tooltip = ' + obj.tooltip.toString().split('this').join("Game.Objects['" + escKey + "']"));
		obj.tooltip = function(){
			var ret = CCSE.Backup.customBuildings[this.name].tooltip();
			for(var i in Game.customBuildings[this.name].tooltip) ret = Game.customBuildings[this.name].tooltip[i](this, ret);
			return ret;
		}
		
		
		// this.levelTooltip
		// Return ret to have no effect
		if(!Game.customBuildings[key].levelTooltip) Game.customBuildings[key].levelTooltip = []; 
		Game.customBuildings[key].levelTooltip.push(CCSE.customBuildingsAlllevelTooltip);
		eval('CCSE.Backup.customBuildings[key].levelTooltip = ' + obj.levelTooltip.toString().replace('this', "Game.Objects['" + escKey + "']"));
		obj.levelTooltip = function(){
			var ret = CCSE.Backup.customBuildings[this.name].levelTooltip();
			for(var i in Game.customBuildings[this.name].levelTooltip) ret = Game.customBuildings[this.name].levelTooltip[i](this, ret);
			return ret;
		}
		
		
		// this.levelUp
		// Haha no. This is like four functions that return each other
		// I'm not dealing with it unless I have to.
		
		
		// this.refresh
		if(!Game.customBuildings[key].refresh) Game.customBuildings[key].refresh = [];
		Game.customBuildings[key].refresh.push(CCSE.customBuildingsAllrefresh);
		temp = obj.refresh.toString();
		eval('obj.refresh = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings[this.name].refresh) Game.customBuildings[this.name].refresh[i](this); 
			` + temp.slice(-1));
		
		
		// this.rebuild
		if(!Game.customBuildings[key].rebuild) Game.customBuildings[key].rebuild = [];
		Game.customBuildings[key].rebuild.push(CCSE.customBuildingsAllrebuild);
		temp = obj.rebuild.toString();
		eval('obj.rebuild = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings[this.name].rebuild) Game.customBuildings[this.name].rebuild[i](this); 
			` + temp.slice(-1));
		
		
		// this.mute
		if(!Game.customBuildings[key].mute) Game.customBuildings[key].mute = [];
		Game.customBuildings[key].mute.push(CCSE.customBuildingsAllmute);
		temp = obj.mute.toString();
		eval('obj.mute = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings[this.name].mute) Game.customBuildings[this.name].mute[i](this, val); 
			` + temp.slice(-1));
		
		
		// this.draw
		if(!Game.customBuildings[key].draw) Game.customBuildings[key].draw = [];
		Game.customBuildings[key].draw.push(CCSE.customBuildingsAlldraw);
		temp = obj.draw.toString();
		eval('obj.draw = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings[this.name].draw) Game.customBuildings[this.name].draw[i](this); 
			` + temp.slice(-1));
		
		
		// this.buyFunction
		if(!Game.customBuildings[key].buyFunction) Game.customBuildings[key].buyFunction = [];
		Game.customBuildings[key].buyFunction.push(CCSE.customBuildingsAllbuyFunction);
		temp = obj.buyFunction.toString();
		eval('obj.buyFunction = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings[this.name].buyFunction) Game.customBuildings[this.name].buyFunction[i](this); 
			` + temp.slice(-1));
		
		
		// this.cps
		// cpsMult Functions should return a value to multiply the price by (Return 1 to have no effect)
		if(!Game.customBuildings[obj.name].cpsMult) Game.customBuildings[obj.name].cpsMult = [];
		Game.customBuildings[key].cpsMult.push(CCSE.customBuildingsAllcpsMult);
		temp = obj.cps.toString();
		eval('obj.cps = ' + temp.replace('return', `
			for(var i in Game.customBuildings[this.name].cpsMult) mult *= Game.customBuildings[this.name].cpsMult[i](me);
			return`));
		
	}
	
	CCSE.ReplaceUpgrade = function(key){
		var temp = '';
		var pos = 0;
		var proto;
		var escKey = key.replace(/'/g, "\\'");
		var upgrade = Game.Upgrades[key];
		
		if(!Game.customUpgrades[key]) Game.customUpgrades[key] = {};
		CCSE.Backup.customUpgrades[key] = {};
		
		
		// this.getPrice
		// Functions should return a value to multiply the price by (Return 1 to have no effect)
		if(!Game.customUpgrades[key].getPrice) Game.customUpgrades[key].getPrice = []; 
		Game.customUpgrades[key].getPrice.push(CCSE.customUpgradesAllgetPrice);
		temp = upgrade.getPrice.toString();
		eval('upgrade.getPrice = ' + temp.replace('return Math', `
			for(var i in Game.customUpgrades[this.name].getPrice) price *= Game.customUpgrades[this.name].getPrice[i](this);
			return Math`));
		
		
		// this.click
		if(!Game.customUpgrades[key].click) Game.customUpgrades[key].click = [];
		Game.customUpgrades[key].click.push(CCSE.customUpgradesAllclick);
		temp = upgrade.click.toString();
		eval('upgrade.click = ' + temp.slice(0, -1) + `
				for(var i in Game.customUpgrades[this.name].click) Game.customUpgrades[this.name].click[i](this, e); 
			` + temp.slice(-1));
		
		
		// this.buy
		if(!Game.customUpgrades[key].buy) Game.customUpgrades[key].buy = []; 
		Game.customUpgrades[key].buy.push(CCSE.customUpgradesAllbuy);
		temp = upgrade.buy.toString();
		eval('upgrade.buy = ' + temp.replace('return', `
			for(var i in Game.customUpgrades[this.name].buy) Game.customUpgrades[this.name].buy[i](this, bypass, success);
			return`));
		
		
		// this.earn 
		if(!Game.customUpgrades[key].earn) Game.customUpgrades[key].earn = [];
		Game.customUpgrades[key].earn.push(CCSE.customUpgradesAllearn);
		temp = upgrade.earn.toString();
		eval('upgrade.earn = ' + temp.slice(0, -1) + `
				for(var i in Game.customUpgrades[this.name].earn) Game.customUpgrades[this.name].earn[i](this); 
			` + temp.slice(-1));
		
		
		// this.unearn
		if(!Game.customUpgrades[key].unearn) Game.customUpgrades[key].unearn = [];
		Game.customUpgrades[key].unearn.push(CCSE.customUpgradesAllunearn);
		temp = upgrade.unearn.toString();
		eval('upgrade.unearn = ' + temp.slice(0, -1) + `
				for(var i in Game.customUpgrades[this.name].unearn) Game.customUpgrades[this.name].unearn[i](this); 
			` + temp.slice(-1));
		
		
		// this.unlock
		if(!Game.customUpgrades[key].unlock) Game.customUpgrades[key].unlock = [];
		Game.customUpgrades[key].unlock.push(CCSE.customUpgradesAllunlock);
		temp = upgrade.unlock.toString();
		eval('upgrade.unlock = ' + temp.slice(0, -1) + `
				for(var i in Game.customUpgrades[this.name].unlock) Game.customUpgrades[this.name].unlock[i](this); 
			` + temp.slice(-1));
		
		
		// this.lose
		if(!Game.customUpgrades[key].lose) Game.customUpgrades[key].lose = [];
		Game.customUpgrades[key].lose.push(CCSE.customUpgradesAlllose);
		temp = upgrade.lose.toString();
		eval('upgrade.lose = ' + temp.slice(0, -1) + `
				for(var i in Game.customUpgrades[this.name].lose) Game.customUpgrades[this.name].lose[i](this); 
			` + temp.slice(-1));
		
		
		// this.toggle
		if(!Game.customUpgrades[key].toggle) Game.customUpgrades[key].toggle = [];
		Game.customUpgrades[key].toggle.push(CCSE.customUpgradesAlltoggle);
		temp = upgrade.toggle.toString();
		eval('upgrade.toggle = ' + temp.slice(0, -1) + `
				for(var i in Game.customUpgrades[this.name].toggle) Game.customUpgrades[this.name].toggle[i](this); 
			` + temp.slice(-1));
		
		
		// this.buyFunction
		if(!Game.customUpgrades[key].buyFunction) Game.customUpgrades[key].buyFunction = [];
		Game.customUpgrades[key].buyFunction.push(CCSE.customUpgradesAllbuyFunction);
		if(upgrade.buyFunction){
			temp = upgrade.buyFunction.toString();
			eval('upgrade.buyFunction = ' + temp.slice(0, -1) + `
				for(var i in Game.customUpgrades[this.name].buyFunction) Game.customUpgrades[this.name].buyFunction[i](this); 
			` + temp.slice(-1));
		}else{
			upgrade.buyFunction = function(){
				for(var i in Game.customUpgrades[this.name].buyFunction) Game.customUpgrades[this.name].buyFunction[i](this);
			}
		}
		
		
		// this.descFunc
		if(!Game.customUpgrades[key].descFunc) Game.customUpgrades[key].descFunc = [];
		Game.customUpgrades[key].descFunc.push(CCSE.customUpgradesAlldescFunc);
		if(upgrade.descFunc){
			eval('CCSE.Backup.customUpgrades[key].descFunc = ' + upgrade.descFunc.toString().split('this.').join("Game.Upgrades['" + escKey + "']."));
			upgrade.descFunc = function(){
				var desc = CCSE.Backup.customUpgrades[this.name].descFunc();
				for(var i in Game.customUpgrades[this.name].descFunc) desc = Game.customUpgrades[this.name].descFunc[i](this, desc);
				return desc;
			}
		}else{
			upgrade.descFunc = function(){
				var desc = this.desc;
				for(var i in Game.customUpgrades[this.name].descFunc) desc = Game.customUpgrades[this.name].descFunc[i](this, desc);
				return desc;
			}
		}
		
		
	}
	
	CCSE.ReplaceAchievement = function(key){
		var temp = '';
		var pos = 0;
		var proto;
		var escKey = key.replace(/'/g, "\\'");
		var achievement = Game.Achievements[key];
		
		if(!Game.customAchievements[key]) Game.customAchievements[key] = {};
		CCSE.Backup.customAchievements[key] = {};
		
		
		// this.click
		if(!Game.customAchievements[key].click) Game.customAchievements[key].click = [];
		Game.customAchievements[key].click.push(CCSE.customAchievementsAllclick);
		temp = achievement.click.toString();
		eval('achievement.click = ' + temp.slice(0, -1) + `
				for(var i in Game.customAchievements[this.name].click) Game.customAchievements[this.name].click[i](this); 
			` + temp.slice(-1));
		
	}
	
	
	/*=====================================================================================
	Menu functions
	=======================================================================================*/
	CCSE.AppendOptionsMenu = function(inp){
		// Accepts inputs of either string or div
		var div;
		if(typeof inp == 'string'){
			div = document.createElement('div');
			div.innerHTML = inp;
		}
		else{
			div = inp;
		}
		
		var menu = l('menu');
		if(menu){
			menu = menu.getElementsByClassName('subsection')[0];
			if(menu){
				var padding = menu.getElementsByTagName('div');
				padding = padding[padding.length - 1];
				if(padding){
					menu.insertBefore(div, padding);
				} else {
					menu.appendChild(div);
				}
			}
		}
	}
	
	CCSE.AppendCollapsibleOptionsMenu = function(title, body){
		// Title must be a string. Body may be either string or div
		var titleDiv = document.createElement('div');
		titleDiv.className = 'title';
		titleDiv.textContent = title + ' ';
		
		if(CCSE.collapseMenu[title] === undefined) CCSE.collapseMenu[title] = 0;
		
		// Stolen wholesale from Cookie Monster
		var span = document.createElement('span');
		span.style.cursor = 'pointer';
		span.style.display = 'inline-block';
		span.style.height = '14px';
		span.style.width = '14px';
		span.style.borderRadius = '7px';
		span.style.textAlign = 'center';
		span.style.backgroundColor = '#C0C0C0';
		span.style.color = 'black';
		span.style.fontSize = '13px';
		span.style.verticalAlign = 'middle';
		span.textContent = (CCSE.collapseMenu[title] ? '+' : '-');
		span.onclick = function(){CCSE.ToggleCollabsibleMenu(title); Game.UpdateMenu();};
		titleDiv.appendChild(span);
		
		var bodyDiv;
		if(typeof body == 'string'){
			bodyDiv = document.createElement('div');
			bodyDiv.innerHTML = body;
		}
		else{
			bodyDiv = body;
		}
		
		var div = document.createElement('div');
		div.appendChild(titleDiv);
		if(!CCSE.collapseMenu[title]) div.appendChild(bodyDiv);
		
		CCSE.AppendOptionsMenu(div);
	}
	
	CCSE.ToggleCollabsibleMenu = function(title) {
		if(CCSE.collapseMenu[title] == 0){
			CCSE.collapseMenu[title]++;
		}
		else{
			CCSE.collapseMenu[title]--;
		}
	}
	
	CCSE.AppendStatsGeneral = function(inp){
		// Accepts inputs of either string or div
		var div;
		if(typeof inp == 'string'){
			div = document.createElement('div');
			div.innerHTML = inp;
		}
		else{
			div = inp;
		}
		
		var general;
		var subsections = l('menu').getElementsByClassName('subsection');
		
		for(var i in subsections){
			if(subsections[i].childNodes && subsections[i].childNodes[0].innerHTML == 'General'){
				general = subsections[i];
				break;
			}
		}
		
		if(general){
			var br = general.getElementsByTagName('br')[0];
			if(br) general.insertBefore(div, br);
		}
	}
	
	CCSE.AppendStatsSpecial = function(inp){
		// Accepts inputs of either string or div
		var div;
		if(typeof inp == 'string'){
			div = document.createElement('div');
			div.innerHTML = inp;
		}
		else{
			div = inp;
		}
		
		var special;
		var subsections = l('menu').getElementsByClassName('subsection');
		
		for(var i in subsections){
			if(subsections[i].childNodes && subsections[i].childNodes[0].innerHTML == 'Special'){
				special = subsections[i];
				break;
			}
		}
		
		if(!special){
			var general;
			subsections = l('menu').getElementsByClassName('subsection');
			
			for(var i in subsections){
				if(subsections[i].childNodes && subsections[i].childNodes[0].innerHTML == 'General'){
					general = subsections[i];
					break;
				}
			}
			
			if(general){
				special = document.createElement('div');
				special.className = 'subsection';
				special.innerHTML = '<div class="title">Special</div>';
				l('menu').insertBefore(special, subsections[1]);
			}
		}
		
		special.appendChild(div);
	}
	
	CCSE.AppendStatsVersionNumber = function(modName, versionString){
		var general;
		var str = '<b>' + modName + ' version :</b> ' + versionString;
		var div = document.createElement('div');
		div.className = 'listing';
		div.innerHTML = str;
		
		var subsections = l('menu').getElementsByClassName('subsection');
		for(var i in subsections){
			if(subsections[i].childNodes && subsections[i].childNodes[0].innerHTML == 'General'){
				general = subsections[i];
				break;
			}
		}
		
		if(general) general.appendChild(div);
	}
	
	
	/*=====================================================================================
	Minigames
	=======================================================================================*/
	CCSE.MinigameReplacer = function(func, objKey){
		var me = Game.Objects[objKey];
		if(me.minigameLoaded) func(me, 'minigameScript-' + me.id);
		else Game.customMinigameOnLoad[objKey].push(func);
	}
	
	
	/*=====================================================================================
	Grimoire
	=======================================================================================*/
	CCSE.RedrawSpells = function(){
		var str = '';
		var M = Game.Objects['Wizard tower'].minigame;
		
		for (var i in M.spells){
			var me = M.spells[i];
			var icon = me.icon || [28,12];
			str += '<div class="grimoireSpell titleFont" id="grimoireSpell' + me.id + '" ' + Game.getDynamicTooltip('Game.ObjectsById[' + M.parent.id + '].minigame.spellTooltip(' + me.id + ')','this') + '><div class="usesIcon shadowFilter grimoireIcon" style="background-position:' + (-icon[0] * 48) + 'px ' + (-icon[1] * 48) + 'px;"></div><div class="grimoirePrice" id="grimoirePrice' + me.id + '">-</div></div>';
		}
		
		l('grimoireSpells').innerHTML = str;
		
		for (var i in M.spells){
			var me = M.spells[i];
			AddEvent(l('grimoireSpell' + me.id), 'click', function(spell){return function(){PlaySound('snd/tick.mp3'); M.castSpell(spell);}}(me));
		}
		
		if(typeof CM != 'undefined') CM.Disp.AddTooltipGrimoire();
	}
	
	CCSE.NewSpell = function(key, spell){
		var M = Game.Objects['Wizard tower'].minigame;
		
		M.spells[key] = spell;
		
		M.spellsById = [];
		var n = 0;
		for(var i in M.spells){
			M.spells[i].id = n;
			M.spellsById[n] = M.spells[i];
			n++;
		}
		
		CCSE.RedrawSpells();
	}
	
	
	/*=====================================================================================
	Upgrades
	=======================================================================================*/
	CCSE.NewHeavenlyUpgrade = function(name, desc, price, icon, posX, posY, parents, buyFunction){
		var me = new Game.Upgrade(name, desc, price, icon, buyFunction);
		Game.PrestigeUpgrades.push(me);
		
		me.pool = 'prestige';
		me.posX = posX;
		me.posY = posY;
		
		me.parents = parents;
		if(me.parents.length == 0) me.parents = ['Legacy'];
		me.parents = me.parents || [-1];
		for(var ii in me.parents){
			if(me.parents[ii] != -1) me.parents[ii] = Game.Upgrades[me.parents[ii]];
		}
		
		return me;
	}
	
	
	/*=====================================================================================
	GRANDMAPOCALYPSE
	=======================================================================================*/
	CCSE.AddMoreWrinklers = function(n){
		var j = Game.wrinklers.length;
		for (var i = j; i < j + n; i++){
			Game.wrinklers.push({id:parseInt(i),close:0,sucked:0,phase:0,x:0,y:0,r:0,hurt:0,hp:Game.wrinklerHP,selected:0,type:0});
		}
	}
	
	
	/*=====================================================================================
	Special Objects
	=======================================================================================*/
	CCSE.CreateSpecialObject = function(name, conditionFunc, pictureFunc, drawFunc){
		// name            the key to identify this particular special object. Must be unique
		// conditionFunc   a function that returns true if the object should be shown, false if not
		// pictureFunc     a function that recieves and alters an object picframe{pic:<url>, frame:<integer>}
		// drawFunc        a function that recieves and returns an HTML string.
		
		Game.customSpecialTabs.push(function(){
			if(conditionFunc()) Game.specialTabs.push('timer');
		});
		
		Game.customDrawSpecialPic.push(function(picframe, tab){
			if(tab == name) pictureFunc(picframe);
		});
		
		
		Game.customToggleSpecialMenu.push(function(str){
			if(Game.specialTab == name) str = drawFunc(str);
			return str;
		});
	}
	
	CCSE.SetSpecialMenuImage = function(str, pic, frame){
		return str.replace('background:url(img/dragon.png?v='+Game.version+');background-position:-384px 0px;', 
						  'background:url(' + pic + ');background-position:' + (frame * (-96)) + 'px 0px;');
	}
	
	
	/*=====================================================================================
	Start your engines
	=======================================================================================*/
	CCSE.init();
}

if(!CCSE.isLoaded) CCSE.launch();