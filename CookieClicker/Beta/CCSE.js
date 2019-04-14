Game.Win('Third-party');
if(CCSE === undefined) var CCSE = {};
CCSE.name = 'CCSE';
CCSE.version = '0.16';
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
		
		
		// Game.scriptLoaded
		if(!Game.customScriptLoaded) Game.customScriptLoaded = [];
		if(!Game.customMinigameOnLoad) Game.customMinigameOnLoad = {};
		for(key in Game.Objects) if(!Game.customMinigameOnLoad[key]) Game.customMinigameOnLoad[key] = [];
		
		temp = Game.scriptLoaded.toString();
		eval('Game.scriptLoaded = ' + temp.slice(0, -1) + `
			for(var i in Game.customScriptLoaded) Game.customScriptLoaded[i](who, script); // Who knows, maybe those arguments might be needed
			for(var i in Game.customMinigameOnLoad[who.name]) Game.customMinigameOnLoad[who.name][i](who, script);
		` + temp.slice(-1));
		
		
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
		if(!Game.customBuildings) Game.customBuildings = {};
		CCSE.Backup.customBuildings = {};
		for(var key in Game.Objects){
			CCSE.ReplaceBuilding(key);
		}
		
	}
	
	CCSE.ReplaceShimmerType = function(key){
		var temp = '';
		var pos = 0;
		var proto;
		
		if(!Game.customShimmerTypes[key]) Game.customShimmerTypes[key] = {};
		CCSE.Backup.customShimmerTypes[key] = {};
		
		
		// Game.shimmerTypes[key].initFunc
		// durationMult functions should return a value to multiply the duration by
		if(!Game.customShimmerTypes[key].initFunc) Game.customShimmerTypes[key].initFunc = [];
		if(!Game.customShimmerTypes[key].durationMult) Game.customShimmerTypes[key].durationMult = [];
		temp = Game.shimmerTypes[key].initFunc.toString();
		eval('Game.shimmerTypes[key].initFunc = ' + temp.slice(0, -1).replace(
			'me.dur=dur;', `for(var i in Game.customShimmerTypes['` + key + `'].durationMult) dur *= Game.customShimmerTypes['` + key + `'].durationMult[i](); 
					me.dur=dur;`) + `
					for(var i in Game.customShimmerTypes['` + key + `'].initFunc) Game.customShimmerTypes['` + key + `'].initFunc[i]();
				` + temp.slice(-1));
		
		
		// Game.shimmerTypes[key].updateFunc
		if(!Game.customShimmerTypes[key].updateFunc) Game.customShimmerTypes[key].updateFunc = [];
		temp = Game.shimmerTypes[key].updateFunc.toString();
		eval('Game.shimmerTypes[key].updateFunc = ' + temp.slice(0, -1) + `
					for(var i in Game.customShimmerTypes['` + key + `'].updateFunc) Game.customShimmerTypes['` + key + `'].updateFunc[i](); 
				` + temp.slice(-1));
		
		
		// Game.shimmerTypes[key].popFunc
		if(!Game.customShimmerTypes[key].popFunc) Game.customShimmerTypes[key].popFunc = [];
		temp = Game.shimmerTypes[key].popFunc.toString();
		eval('Game.shimmerTypes[key].popFunc = ' + temp.slice(0, -1) + `
					for(var i in Game.customShimmerTypes['` + key + `'].popFunc) Game.customShimmerTypes['` + key + `'].popFunc[i](); 
				` + temp.slice(-1));
		
		
		// Game.shimmerTypes[key].spawnConditions
		// Return ret to have no effect 
		if(!Game.customShimmerTypes[key].spawnConditions) Game.customShimmerTypes[key].spawnConditions = [];
		CCSE.Backup.customShimmerTypes[key].spawnConditions = Game.shimmerTypes[key].spawnConditions;
		eval(`Game.shimmerTypes['` + key + `'].spawnConditions = function(){
				var ret = CCSE.Backup.customShimmerTypes['` + key + `'].spawnConditions();
				for(var i in Game.customShimmerTypes['` + key + `'].spawnConditions) ret = Game.customShimmerTypes['` + key + `'].spawnConditions[i](ret);
				return ret;
			}`);
		
		
		// Game.shimmerTypes[key].getTimeMod
		// Functions should return a multiplier to the shimmer's spawn time (higher takes longer to spawn)
		// Return 1 to have no effect 
		// These run at the top of the function, before the vanilla code
		if(!Game.customShimmerTypes[key].getTimeMod) Game.customShimmerTypes[key].getTimeMod = [];
		temp = Game.shimmerTypes[key].getTimeMod.toString();
		eval('Game.shimmerTypes[key].getTimeMod = ' + temp.replace('{', `{
					for(var i in Game.customShimmerTypes['` + key + `'].getTimeMod) m *= Game.customShimmerTypes['` + key + `'].getTimeMod[i](me);`));
	}
	
	CCSE.ReplaceBuilding = function(key){
		// A lot of Copy/Paste happened, hence why I did so many functions.
		// Also, I may not have fully tested each one.
		var temp = '';
		var pos = 0;
		var proto;
		var obj = Game.Objects[key];
		
		if(!Game.customBuildings[key]) Game.customBuildings[key] = {};
		CCSE.Backup.customBuildings[key] = {};
		
		
		// this.switchMinigame
		if(!Game.customBuildings[key].switchMinigame) Game.customBuildings[key].switchMinigame = [];
		temp = obj.switchMinigame.toString();
		eval('obj.switchMinigame = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + key + `'].switchMinigame) Game.customBuildings['` + key + `'].switchMinigame[i](this, on); 
			` + temp.slice(-1));
		
		
		// this.getSellMultiplier
		// Return ret to have no effect
		if(!Game.customBuildings[key].getSellMultiplier) Game.customBuildings[key].getSellMultiplier = [];
		temp = obj.getSellMultiplier.toString();
		eval('obj.getSellMultiplier = ' + temp.replace('return', `
				for(var i in Game.customBuildings['` + key + `'].getSellMultiplier) giveBack = Game.customBuildings['` + key + `'].getSellMultiplier[i](this, giveBack); 
				return`));
		
		
		// this.buy
		if(!Game.customBuildings[key].buy) Game.customBuildings[key].buy = [];
		temp = obj.buy.toString();
		eval('obj.buy = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + key + `'].buy) Game.customBuildings['` + key + `'].buy[i](this, amount); 
			` + temp.slice(-1));
		
		
		// this.sell
		if(!Game.customBuildings[key].sell) Game.customBuildings[key].sell = [];
		temp = obj.sell.toString();
		eval('obj.sell = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + key + `'].sell) Game.customBuildings['` + key + `'].sell[i](this, amount, bypass); 
			` + temp.slice(-1));
		
		
		// this.sacrifice
		if(!Game.customBuildings[key].sacrifice) Game.customBuildings[key].sacrifice = [];
		temp = obj.sacrifice.toString();
		eval('obj.sacrifice = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + key + `'].sacrifice) Game.customBuildings['` + key + `'].sacrifice[i](this, amount); 
			` + temp.slice(-1));
		
		
		// this.buyFree
		if(!Game.customBuildings[key].buyFree) Game.customBuildings[key].buyFree = [];
		temp = obj.buyFree.toString();
		eval('obj.buyFree = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + key + `'].buyFree) Game.customBuildings['` + key + `'].buyFree[i](this, amount); 
			` + temp.slice(-1));
		
		
		// this.getFree
		if(!Game.customBuildings[key].getFree) Game.customBuildings[key].getFree = [];
		temp = obj.getFree.toString();
		eval('obj.getFree = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + key + `'].getFree) Game.customBuildings['` + key + `'].getFree[i](this, amount); 
			` + temp.slice(-1));
		
		
		// this.getFreeRanks
		if(!Game.customBuildings[key].getFreeRanks) Game.customBuildings[key].getFreeRanks = [];
		temp = obj.getFreeRanks.toString();
		eval('obj.getFreeRanks = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + key + `'].getFreeRanks) Game.customBuildings['` + key + `'].getFreeRanks[i](this, amount); 
			` + temp.slice(-1));
		
		
		// this.tooltip
		// Return ret to have no effect
		if(!Game.customBuildings[key].tooltip) Game.customBuildings[key].tooltip = []; 
		eval('CCSE.Backup.customBuildings[key].tooltip = ' + obj.tooltip.toString().split('this').join("Game.Objects['" + key + "']"));
		obj.tooltip = function(){
			var ret = CCSE.Backup.customBuildings[this.name].tooltip();
			for(var i in Game.customBuildings[this.name].tooltip) ret = Game.customBuildings[this.name].tooltip[i](this, ret);
			return ret;
		}
		
		
		// this.levelTooltip
		// Return ret to have no effect
		if(!Game.customBuildings[key].levelTooltip) Game.customBuildings[key].levelTooltip = []; 
		eval('CCSE.Backup.customBuildings[key].levelTooltip = ' + obj.levelTooltip.toString().replace('this', "Game.Objects['" + key + "']"));
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
		temp = obj.refresh.toString();
		eval('obj.refresh = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + key + `'].refresh) Game.customBuildings['` + key + `'].refresh[i](this); 
			` + temp.slice(-1));
		
		
		// this.rebuild
		if(!Game.customBuildings[key].rebuild) Game.customBuildings[key].rebuild = [];
		temp = obj.rebuild.toString();
		eval('obj.rebuild = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + key + `'].rebuild) Game.customBuildings['` + key + `'].rebuild[i](this); 
			` + temp.slice(-1));
		
		
		// this.mute
		if(!Game.customBuildings[key].mute) Game.customBuildings[key].mute = [];
		temp = obj.mute.toString();
		eval('obj.mute = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + key + `'].mute) Game.customBuildings['` + key + `'].mute[i](this, val); 
			` + temp.slice(-1));
		
		
		// this.draw
		if(!Game.customBuildings[key].draw) Game.customBuildings[key].draw = [];
		temp = obj.draw.toString();
		eval('obj.draw = ' + temp.slice(0, -1) + `
				for(var i in Game.customBuildings['` + key + `'].draw) Game.customBuildings['` + key + `'].draw[i](this); 
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
	Start your engines
	=======================================================================================*/
	CCSE.init();
}

if(!CCSE.isLoaded) CCSE.launch();