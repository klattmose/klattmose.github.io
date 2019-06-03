Game.Win('Third-party');
if(CCSE === undefined) var CCSE = {};
CCSE.name = 'CCSE';
CCSE.version = '2.015';
CCSE.GameVersion = '2.019';

CCSE.launch = function(){
	CCSE.loading = 1;
	
	CCSE.init = function(){
		CCSE.InitNote();
		
		// Define more parts of CCSE
		CCSE.Backup = {};
		CCSE.collapseMenu = {};
		if(!Game.customMinigame) Game.customMinigame = {};
		for(var key in Game.Objects) if(!Game.customMinigame[key]) Game.customMinigame[key] = {};
		
		
		// Build a list of functions to feed to requestAnimationFrame
		CCSE.playlist = [];
		CCSE.track = 0;
		
		CCSE.playlist.push(function(){
			CCSE.ReplaceMainGame();
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		CCSE.playlist.push(function(){
			CCSE.MinigameReplacer(CCSE.ReplaceGrimoire, 'Wizard tower');
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		CCSE.playlist.push(function(){
			CCSE.MinigameReplacer(CCSE.ReplacePantheon, 'Temple');
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		CCSE.playlist.push(function(){
			CCSE.MinigameReplacer(CCSE.ReplaceGarden, 'Farm');
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		
		
		CCSE.playlist.push(function(){
			CCSE.ReplaceBuildingsStart();
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		CCSE.playlist.push(CCSE.ReplaceBuildings); // We'll call the next one from here
		CCSE.playlist.push(function(){
			CCSE.ReplaceBuildingsFinish();
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		
		
		CCSE.playlist.push(function(){
			CCSE.ReplaceUpgradesStart();
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		CCSE.playlist.push(CCSE.ReplaceUpgrades); // We'll call the next one from here
		CCSE.playlist.push(function(){
			CCSE.ReplaceUpgradesFinish();
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		
		
		CCSE.playlist.push(function(){
			CCSE.ReplaceAchievementsStart();
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		});
		CCSE.playlist.push(CCSE.ReplaceAchievements); // We'll call the next one from here
		
		
		CCSE.playlist.push(CCSE.finalize);
		
		requestAnimationFrame(CCSE.playlist[CCSE.track++]);
	}
	
	CCSE.finalize = function(){
		// Load any custom save data and inject save functions
		CCSE.LoadSave();
		Game.customSave.push(CCSE.WriteSave);
		Game.customLoad.push(CCSE.LoadSave);
		//Game.customReset.push(CCSE.Reset); Nevermind
		
		
		// Inject menu functions
		Game.customOptionsMenu.push(function(){
			CCSE.AppendCollapsibleOptionsMenu(CCSE.name, CCSE.GetMenuString());
		});
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(CCSE.name, CCSE.version);
		});
		
		Game.customInfoMenu.push(function(){
			CCSE.PrependCollapsibleInfoMenu(CCSE.name, CCSE.updateLog);
		});
		
		l('versionNumber').innerHTML = 'Game ' + l('versionNumber').innerHTML + '<br>CCSE v. ' + CCSE.version;
		
		
		// Announce completion, set the isLoaded flag, and run any functions that were waiting for this to load
		CCSE.Note.title = 'CCSE loaded!';
		CCSE.Note.life = Game.fps;
		CCSE.isLoaded = 1;
		CCSE.loading = 0;
		if(CCSE.postLoadHooks) for(var i in CCSE.postLoadHooks) CCSE.postLoadHooks[i]();
	}
	
	
	/*=====================================================================================
	Update history
	=======================================================================================*/
	{	CCSE.updateLog = '<div class="subsection"><div class="listing">Cookie Clicker Script Extender is a modding framework intended to make modding this game easier and more accessible.</div>' +
			'<div class="listing">CCSE is written and maintained by Klattmose (<a href="https://github.com/klattmose" target="_blank">GitHub</a>, <a href="https://www.reddit.com/user/klattmose/" target="_blank">reddit</a>)</div>' +
			'<div class="listing">Further documentation can be found <a href="https://klattmose.github.io/CookieClicker/CCSE-POCs/" target="_blank">here</a>.</div>' +
			'<div class="listing">If you have a bug report or a suggestion, create an issue <a href="https://github.com/klattmose/klattmose.github.io/issues" target="_blank">here</a>.</div></div>' +
			'<div class="subsection"><div class="title">CCSE version history</div>' +
			
			'</div><div class="subsection update small"><div class="title">05/14/2019 - parallel processing</div>' + 
			'<div class="listing">&bull; Won\'t freeze the game while CCSE is loading</div>' +
			'<div class="listing">&bull; Also has a progress meter for feedback</div>' + 
			'<div class="listing">&bull; Bug fixes</div>' + 
			
			'</div><div class="subsection update"><div class="title">05/11/2019 - take two</div>' + 
			'<div class="listing">&bull; You know that moment where you do something and then immediately realize a better way to do it?</div>' +
			'<div class="listing">&bull; Changed the method for injecting code to standardized functions rather than calling "eval" willy-nilly</div>' +
			'<div class="listing">&bull; Added function for creating seasons</div>' +
			'<div class="listing">&bull; Created this update log, and put the version number in the lower left corner</div>' +
			'<div class="listing">&bull; With apologies for pretending to be a game update</div>' +
			
			'</div><div class="subsection update"><div class="title">05/05/2019 - initial release</div>' +
			'<div class="listing">&bull; Added a bunch of mod hooks to the game</div>' +
			'<div class="listing">&bull; Added functions to ease the creation of content like achievements and buildings</div>' +
			'<div class="listing">&bull; Added a save system to manage game objects created through CCSE</div>' +
			'<div class="listing">&bull; Further documentation <a href="https://klattmose.github.io/CookieClicker/CCSE-POCs/" target="_blank">here</a></div>' +
			'</div><div class="subsection"></div><div class="section">Cookie Clicker</div>';
	}
	
	
	/*=====================================================================================
	The heart of the mod. Functions to inject code into functions.
	=======================================================================================*/
	CCSE.SliceCodeIntoFunction = function(functionName, pos, code, preEvalScript, hasPrototype){
		// preEvalScript is to set variables that are used in the function but aren't declared in the function
		if(preEvalScript) eval(preEvalScript);
		
		var proto;
		if(hasPrototype) proto = eval(functionName + ".prototype");
		
		var temp = eval(functionName + ".toString()");
		temp = temp.slice(0, pos) + code + temp.slice(pos);
		
		//console.log(functionName);
		eval(functionName + " = " + temp);
		if(hasPrototype) eval(functionName + ".prototype = proto");
		
		CCSE.functionsAltered++;
		if(!CCSE.isLoaded) CCSE.UpdateNote();
		//if(eval(functionName + ".toString()").indexOf(code) == -1) console.log("Error injecting code into function " + functionName + ". Could not inject " + code);
	}
	
	CCSE.SpliceCodeIntoFunction = function(functionName, row, code, preEvalScript, hasPrototype){
		// preEvalScript is to set variables that are used in the function but aren't declared in the function
		if(preEvalScript) eval(preEvalScript);
		
		var proto;
		if(hasPrototype) proto = eval(functionName + ".prototype");
		var i = Math.floor(row);
		if(i == 0) throw new Error("row cannot be zero");
		
		var temp = eval(functionName + ".toString()").split("\n");
		
		i = row < 0 ? temp.length + row : row;
		temp.splice(i, 0, code);
		
		//console.log(functionName);
		eval(functionName + " = " + temp.join("\n"));
		if(hasPrototype) eval(functionName + ".prototype = proto");
		
		CCSE.functionsAltered++;
		if(!CCSE.isLoaded) CCSE.UpdateNote();
		//if(eval(functionName + ".toString()").indexOf(code) == -1) console.log("Error injecting code into function " + functionName + ". Could not inject " + code);
	}
	
	CCSE.ReplaceCodeIntoFunction = function(functionName, targetString, code, mode, preEvalScript, hasPrototype){
		// preEvalScript is to set variables that are used in the function but aren't declared in the function
		if(preEvalScript) eval(preEvalScript);
		
		var proto;
		if(hasPrototype) proto = eval(functionName + ".prototype");
		var temp = eval(functionName + ".toString()");
		
		switch(mode){
			case -1: // Insert before targetString
				temp = temp.replace(targetString, code + "\n" + targetString);
				break;
			case 0: // Replace targetString. Regex should work
				temp = temp.replace(targetString, code);
				break;
			case 1: // Insert after targetString
				temp = temp.replace(targetString, targetString + "\n" + code);
				break;
			default:
				throw new Error("mode must be either, -1, 0, or 1");
		}
		
		eval(functionName + " = " + temp);
		if(hasPrototype) eval(functionName + ".prototype = proto");
		
		CCSE.functionsAltered++;
		if(!CCSE.isLoaded) CCSE.UpdateNote();
		//if(eval(functionName + ".toString()").indexOf(code) == -1) console.log("Error injecting code into function " + functionName + ".");
	}
	
	CCSE.InitNote = function(){
		CCSE.iconURL = 'https://klattmose.github.io/CookieClicker/img/CCSEicon.png';
		CCSE.functionsTotal = 120 + 
							(Game.Objects['Wizard tower'].minigameLoaded ? 10 : 0) +
							(Game.Objects['Temple'].minigameLoaded ? 10 : 0) +
							(Game.Objects['Farm'].minigameLoaded ? 33 : 0) +
							Game.ObjectsN * 18 - 1 + 
							Game.UpgradesN * 9 + 
							Game.AchievementsN * 1; // Needs to be manually updated
		CCSE.functionsAltered = 0;
		CCSE.progress = 0;
		
		Game.Notify('CCSE is initializing', '<div style="text-align: center;font-weight: bold;color: #ffffff;">0%</div>', [0, 0, CCSE.iconURL], 6, 1);
		CCSE.Note = Game.NotesById[Game.noteId - 1];
		CCSE.Note.life = 600000; // 10 minutes, just to be sure
	}
	
	CCSE.UpdateNote = function(){
		CCSE.Note.life = 600000;
		var progress = Math.floor(CCSE.functionsAltered / CCSE.functionsTotal * 100);
		if(progress != CCSE.progress){
			CCSE.progress = progress;
			CCSE.Note.desc = '<div style="text-align: center;font-weight: bold;color: #ffffff;">' + CCSE.progress + '%</div>';
			Game.UpdateNotes();
		}
	}
	
	
	/*=====================================================================================
	Do all replacing in one function
	Actually don't, it locks up the browser for as long as it's running
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
		CCSE.SliceCodeIntoFunction('Game.UpdateMenu', -1, `
			if(Game.onMenu == 'prefs'){
				// Game.UpdateMenu injection point 0
				for(var i in Game.customOptionsMenu) Game.customOptionsMenu[i]();
			}
			else if(Game.onMenu == 'stats'){
				// Game.UpdateMenu injection point 1
				for(var i in Game.customStatsMenu) Game.customStatsMenu[i]();
			}
			else if(Game.onMenu == 'log'){
				// Game.UpdateMenu injection point 2
				for(var i in Game.customInfoMenu) Game.customInfoMenu[i]();
			}
			
			// Any that don't want to fit into a label
			// Game.UpdateMenu injection point 3
			for(var i in Game.customMenu) Game.customMenu[i]();
		`);
		
		
		// Game.LoadSave
		if(!(Game.LoadSave.toString().indexOf('Game.customLoad') > 0)){
			CCSE.ReplaceCodeIntoFunction('Game.LoadSave', 'if (Game.prefs.showBackupWarning==1)', 
					`// Game.LoadSave injection point 0
					for(var i in Game.customLoad) Game.customLoad[i](); `, -1);
		}
		
		
		// Game.WriteSave
		// This section only exists to support custom seasons
		CCSE.ReplaceCodeIntoFunction('Game.WriteSave', '(Game.season?', '((Game.season)?', 0);
		CCSE.ReplaceCodeIntoFunction('Game.WriteSave', '(Game.seasonT)', '((Game.season)?Game.seasonT:-1)', 0);
		
		
		// Game.Reset
		if(!Game.customReset) Game.customReset = [];
		CCSE.SliceCodeIntoFunction('Game.Reset', -1, `
			// Game.Reset injection point 0
			for(var i in Game.customReset) Game.customReset[i](hard);
		`);
		
		
		// randomFloor
		// Gonna just replace it and try to keep up with any changes (however unlikely)
		// function randomFloor(x) {if ((x%1)<Math.random()) return Math.floor(x); else return Math.ceil(x);}
		// Return ret to have no effect
		if(!Game.customRandomFloor) Game.customRandomFloor = []; 
		randomFloor = function(x){
			var ret;
			if ((x%1)<Math.random()) ret = Math.floor(x); 
			else ret = Math.ceil(x);
			// randomFloor injection point 0
			for(var i in Game.customRandomFloor) ret = Game.customRandomFloor[i](x, ret);
			return ret;
		}
		
		
		// Beautify
		// Return ret to have no effect
		if(!Game.customBeautify) Game.customBeautify = [];
		CCSE.ReplaceCodeIntoFunction('Beautify', "return negative?'-'+output:output+decimal;", 
	`var ret = negative?'-'+output:output+decimal;
	// Beautify injection point 0
	for(var i in Game.customBeautify) ret = Game.customBeautify[i](value, floats, ret);
	return ret;`, 0);
		
		
		// Game.Loader.Load
		// To allow for images from outside the dashnet domain
		CCSE.ReplaceCodeIntoFunction('Game.Loader.Load', 'img.src=this.domain', "img.src=(assets[i].indexOf('http')>=0?'':this.domain)", 0);
		
		
		// -----     Tooltips block     ----- //
		
		// Game.tooltip.draw
		if(!Game.customTooltipDraw) Game.customTooltipDraw = [];
		CCSE.SliceCodeIntoFunction('Game.tooltip.draw', -1, `
			// Game.tooltip.draw injection point 0
			for(var i in Game.customTooltipDraw) Game.customTooltipDraw[i](from, text, origin);
		`);
		
		
		// Game.tooltip.update
		if(!Game.customTooltipUpdate) Game.customTooltipUpdate = [];
		CCSE.SliceCodeIntoFunction('Game.tooltip.update', -1, `
			// Game.tooltip.update injection point 0
			for(var i in Game.customTooltipUpdate) Game.customTooltipUpdate[i]();
			`);
		
		
		// -----     Ascension block     ----- //
		
		// Game.HowMuchPrestige
		// Return ret to have no effect
		if(!Game.customHowMuchPrestige) Game.customHowMuchPrestige = [];
		CCSE.ReplaceCodeIntoFunction('Game.HowMuchPrestige', 'return', "var ret = ", 0);
		CCSE.SliceCodeIntoFunction('Game.HowMuchPrestige', -1, `
			// Game.HowMuchPrestige injection point 0
			for(var i in Game.customHowMuchPrestige) ret = Game.customHowMuchPrestige[i](cookies, ret);
			return ret;
		`);
		
		
		// Game.HowManyCookiesReset
		// Return ret to have no effect
		if(!Game.customHowManyCookiesReset) Game.customHowManyCookiesReset = []; 
		CCSE.ReplaceCodeIntoFunction('Game.HowManyCookiesReset', 'return', "var ret = ", 0);
		CCSE.SliceCodeIntoFunction('Game.HowManyCookiesReset', -1, `
			// Game.HowManyCookiesReset injection point 0
			for(var i in Game.customHowManyCookiesReset) ret = Game.customHowManyCookiesReset[i](chips, ret);
			return ret;
		`);
		
		
		// Game.GetHeavenlyMultiplier
		// Functions should return a value to multiply the heavenlyMult by
		if(!Game.customHeavenlyMultiplier) Game.customHeavenlyMultiplier = []; 
		CCSE.ReplaceCodeIntoFunction('Game.GetHeavenlyMultiplier', 'return heavenlyMult;', `
			// Game.GetHeavenlyMultiplier injection point 0
			for(var i in Game.customHeavenlyMultiplier) heavenlyMult *= Game.customHeavenlyMultiplier[i]();`, -1);
		
		
		// Game.UpdateAscensionModePrompt
		if(!Game.customUpdateAscensionModePrompt) Game.customUpdateAscensionModePrompt = [];
		CCSE.SliceCodeIntoFunction('Game.UpdateAscensionModePrompt', -1, `
			// Game.UpdateAscensionModePrompt injection point 0
			for(var i in Game.customUpdateAscensionModePrompt) Game.customUpdateAscensionModePrompt[i]();
		`);
		
		
		// Game.Reincarnate
		// Only runs when bypass == 1 (i.e. passed the confirmation prompt)
		if(!Game.customReincarnate) Game.customReincarnate = [];
		CCSE.SliceCodeIntoFunction('Game.Reincarnate', -2, `
				// Game.Reincarnate injection point 0
				for(var i in Game.customReincarnate) Game.customReincarnate[i]();
			`);
		
		
		// Game.Ascend
		// Only runs when bypass == 1 (i.e. passed the confirmation prompt)
		if(!Game.customAscend) Game.customAscend = [];
		CCSE.SliceCodeIntoFunction('Game.Ascend', -2, `
				// Game.Ascend injection point 0
				for(var i in Game.customAscend) Game.customAscend[i]();
			`);
		
		
		// Game.UpdateAscend
		// Runs every frame while on the Ascension tree
		if(!Game.customUpdateAscend) Game.customUpdateAscend = [];
		CCSE.SliceCodeIntoFunction('Game.UpdateAscend', -1, `
			// Game.UpdateAscend injection point 0
			for(var i in Game.customUpdateAscend) Game.customUpdateAscend[i]();
		`);
		
		
		// Game.BuildAscendTree
		if(!Game.customBuildAscendTree) Game.customBuildAscendTree = [];
		CCSE.SliceCodeIntoFunction('Game.BuildAscendTree', -1, `
			// Game.BuildAscendTree injection point 0
			for(var i in Game.customBuildAscendTree) Game.customBuildAscendTree[i]();
		`);
		
		
		// -----     Sugar Lumps block     ----- //
		
		// Game.lumpTooltip
		// Return str to have no effect
		if(!Game.customLumpTooltip) Game.customLumpTooltip = [];
		CCSE.ReplaceCodeIntoFunction('Game.lumpTooltip', 'return', 
			`// Game.lumpTooltip injection point 0
			for(var i in Game.customLumpTooltip) str = Game.customLumpTooltip[i](str, phase);`, -1);
		
		
		// Game.computeLumpTimes
		if(!Game.customComputeLumpTimes) Game.customComputeLumpTimes = [];
		CCSE.SliceCodeIntoFunction('Game.computeLumpTimes', -1, `
			// Game.computeLumpTimes injection point 0
			for(var i in Game.customComputeLumpTimes) Game.customComputeLumpTimes[i]();
		`);
		
		
		// Game.gainLumps
		if(!Game.customGainLumps) Game.customGainLumps = [];
		CCSE.SliceCodeIntoFunction('Game.gainLumps', -1, `
			// Game.gainLumps injection point 0
			for(var i in Game.customGainLumps) Game.customGainLumps[i](total);
		`);
		
		
		// Game.clickLump
		if(!Game.customClickLump) Game.customClickLump = [];
		CCSE.SliceCodeIntoFunction('Game.clickLump', -1, `
			// Game.clickLump injection point 0
			for(var i in Game.customClickLump) Game.customClickLump[i]();
		`);
		
		
		// Game.harvestLumps
		if(!Game.customHarvestLumps) Game.customHarvestLumps = [];
		CCSE.ReplaceCodeIntoFunction('Game.harvestLumps', 'total=Math.floor(total);', 
			`// Game.harvestLumps injection point 0`, -1);
		CCSE.ReplaceCodeIntoFunction('Game.harvestLumps', "Game.Win('Maillard reaction');", 
			`// Game.harvestLumps injection point 1`, 1);
		CCSE.SliceCodeIntoFunction('Game.harvestLumps', -1, `
			// Game.harvestLumps injection point 2
			for(var i in Game.customHarvestLumps) Game.customHarvestLumps[i](amount, silent);
		`);
		
		
		// Game.computeLumpType
		// Functions should push things to types
		if(!Game.customComputeLumpType) Game.customComputeLumpType = [];
		CCSE.ReplaceCodeIntoFunction('Game.computeLumpType', '//caramelized', 
				`// Game.computeLumpType injection point 0
				for(var i in Game.customComputeLumpType) Game.customComputeLumpType[i](types);`, 1);
		
		
		// Game.canLumps
		// Return ret to have no effect
		if(!Game.customCanLumps) Game.customCanLumps = [];
		CCSE.SpliceCodeIntoFunction('Game.canLumps', 2, 'var ret;');
		CCSE.ReplaceCodeIntoFunction('Game.canLumps', 'return true;', 'ret = true;', 0);
		CCSE.ReplaceCodeIntoFunction('Game.canLumps', 'return false', 
			`else ret = false;
			// Game.canLumps injection point 0
			for(var i in Game.customCanLumps) ret = Game.customCanLumps[i](ret);
			return ret;`, 0);
		
		
		// Game.getLumpRefillMax
		// Return ret to have no effect
		if(!Game.customLumpRefillMax) Game.customLumpRefillMax = []; 
		CCSE.ReplaceCodeIntoFunction('Game.getLumpRefillMax', 'return', 'var ret =', 0);
		CCSE.SliceCodeIntoFunction('Game.getLumpRefillMax', -1, 
			`// Game.getLumpRefillMax injection point 0
			for(var i in Game.customLumpRefillMax) ret = Game.customLumpRefillMax[i](ret);
			return ret;
		`);
		
		
		// Game.refillLump
		if(!Game.customRefillLump) Game.customRefillLump = [];
		CCSE.SliceCodeIntoFunction('Game.refillLump', -1, `
			// Game.refillLump injection point 0
			for(var i in Game.customRefillLump) Game.customRefillLump[i]();
		`);
		
		
		// Game.doLumps
		// Runs every logic frame when lumps matter
		if(!Game.customDoLumps) Game.customDoLumps = [];
		CCSE.ReplaceCodeIntoFunction('Game.doLumps', 'var icon=', '// Game.doLumps injection point 0', -1);
		CCSE.SliceCodeIntoFunction('Game.doLumps', -1, `
			// Game.doLumps injection point 1
			for(var i in Game.customDoLumps) Game.customDoLumps[i]();
		`);
		
		
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
		CCSE.ReplaceCodeIntoFunction('Game.dropRateMult', 'return', 
			`// Game.dropRateMult injection point 0
			for(var i in Game.customDropRateMult) rate *= Game.customDropRateMult[i]();`, -1);
		
		
		// -----     Shimmers block     ----- //
		
		// Game.shimmer
		// Runs when a shimmer (Golden cookie or reindeer) gets created
		// You can push a function that pops it immediately, but it will mess up any FtHoF predictor you use
		if(!Game.customShimmer) Game.customShimmer = [];
		CCSE.SliceCodeIntoFunction('Game.shimmer', -1, `
			// Game.shimmer injection point 0
			for(var i in Game.customShimmer) Game.customShimmer[i](this);
		`, 0, 1);
		
		// Game.updateShimmers
		// Runs every logic frame when shimmers matter
		if(!Game.customUpdateShimmers) Game.customUpdateShimmers = [];
		CCSE.SliceCodeIntoFunction('Game.updateShimmers', -1, `
			// Game.updateShimmers injection point 0
			for(var i in Game.customUpdateShimmers) Game.customUpdateShimmers[i]();
		`);
		
		
		// Game.killShimmers
		// Runs when we want to remove all shimmers
		if(!Game.customKillShimmers) Game.customKillShimmers = [];
		CCSE.SliceCodeIntoFunction('Game.killShimmers', -1, `
			// Game.killShimmers injection point 0
			for(var i in Game.customKillShimmers) Game.customKillShimmers[i]();
		`);
		
		
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
		// customBuff functions should return a a buff (result from Game.gainBuff). Return buff for no effect
		if(!Game.customShimmerTypes['golden'].customListPush) Game.customShimmerTypes['golden'].customListPush = [];
		if(!Game.customShimmerTypes['golden'].customEffectDurMod) Game.customShimmerTypes['golden'].customEffectDurMod = [];
		if(!Game.customShimmerTypes['golden'].customMult) Game.customShimmerTypes['golden'].customMult = [];
		if(!Game.customShimmerTypes['golden'].customBuff) Game.customShimmerTypes['golden'].customBuff = [];
		CCSE.ReplaceCodeIntoFunction("Game.shimmerTypes['golden'].popFunc", 'var list=[];', 
					`// Game.shimmerTypes['golden'].popFunc injection point 1
					for(var i in Game.customShimmerTypes['golden'].customListPush) Game.customShimmerTypes['golden'].customListPush[i](me, list);`, 1);
		CCSE.ReplaceCodeIntoFunction("Game.shimmerTypes['golden'].popFunc", 'var buff=0;', 
					`// Game.shimmerTypes['golden'].popFunc injection point 2
					for(var i in Game.customShimmerTypes['golden'].customEffectDurMod) effectDurMod *= Game.customShimmerTypes['golden'].customEffectDurMod[i](me);
					for(var i in Game.customShimmerTypes['golden'].customMult) mult *= Game.customShimmerTypes['golden'].customMult[i](me);
					for(var i in Game.customShimmerTypes['golden'].customBuff) buff = Game.customShimmerTypes['golden'].customBuff[i](me, buff, choice, effectDurMod, mult);`, 1);
		
		
		// Game.shimmerTypes['reindeer'].popFunc
		// customDropRateMult should return a multiplier to the fail rate for reindeer drops
		// Game.customDropRateMult is already taken into account. This is for reindeer specific fucntions
		// Return 1 to have no effect. Return 0 for a guarantee*
		if(!Game.customShimmerTypes['reindeer'].customDropRateMult) Game.customShimmerTypes['reindeer'].customDropRateMult = [];
		CCSE.ReplaceCodeIntoFunction("Game.shimmerTypes['reindeer'].popFunc", 'if (Math.random()>failRate)', 
					`// Game.shimmerTypes['reindeer'].popFunc injection point 1
					for(var i in Game.customShimmerTypes['reindeer'].customDropRateMult) failRate *= Game.customShimmerTypes['reindeer'].customDropRateMult[i](me);`, -1);
		
		
		// -----     Particles block       ----- //
		// -----     Notifications block   ----- //
		// -----     Prompts block         ----- //
		// -----     Menu block            ----- //
		// These start to get into the basic appearance of the game, and stray away from the gameplay itself
		// If someone has an idea they want to try that requires hooks into these functions, I can add them then
		
		
		// -----     Buildings block     ----- //
		
		// Game.Object
		// Alter this function so creating new buildings doesn't break the minigames
		CCSE.ReplaceCodeIntoFunction('Game.Object', `var str='<div class="row" id="row'+this.id+'">`, 
				`var div = document.createElement('div');
				div.id = 'row'+this.id;
				div.classList.add('row');
				var str='`, 0);
		CCSE.ReplaceCodeIntoFunction('Game.Object', `str+='<div class="rowSpecial" id="rowSpecial'+this.id+'"></div>';`, 
				`div.innerHTML = str;`, 1);
		CCSE.ReplaceCodeIntoFunction('Game.Object', `l('rows').innerHTML=l('rows').innerHTML+str;`, 
				`l('rows').appendChild(div);`, 0);
		
		
		// Game.DrawBuildings
		// Runs every draw frame if we're not ascending
		if(!Game.customDrawBuildings) Game.customDrawBuildings = [];
		CCSE.SliceCodeIntoFunction('Game.DrawBuildings', -1, `
			// Game.DrawBuildings injection point 0
			for(var i in Game.customDrawBuildings) Game.customDrawBuildings[i]();
		`);
		
		
		// Game.modifyBuildingPrice
		// Functions should return a value to multiply the price by
		// Return 1 to have no effect
		if(!Game.customModifyBuildingPrice) Game.customModifyBuildingPrice = [];
		CCSE.ReplaceCodeIntoFunction('Game.modifyBuildingPrice', 'return', `
			// Game.modifyBuildingPrice injection point 0
			for(var i in Game.customModifyBuildingPrice) price *= Game.customModifyBuildingPrice[i](building, price);`, -1);
		
		
		// Game.storeBulkButton
		if(!Game.customStoreBulkButton) Game.customStoreBulkButton = [];
		CCSE.SliceCodeIntoFunction('Game.storeBulkButton', -1, `
			// Game.storeBulkButton injection point 0
			for(var i in Game.customStoreBulkButton) Game.customStoreBulkButton[i]();
		`);
		
		
		// Game.BuildStore
		if(!Game.customBuildStore) Game.customBuildStore = [];
		CCSE.SliceCodeIntoFunction('Game.BuildStore', -1, `
			// Game.BuildStore injection point 0
			for(var i in Game.customBuildStore) Game.customBuildStore[i]();
		`);
		
		
		// Game.RefreshStore
		if(!Game.customRefreshStore) Game.customRefreshStore = [];
		CCSE.SliceCodeIntoFunction('Game.RefreshStore', -1, `
			// Game.RefreshStore injection point 0
			for(var i in Game.customRefreshStore) Game.customRefreshStore[i]();
		`);
		
		
		// Game.scriptLoaded
		if(!Game.customScriptLoaded) Game.customScriptLoaded = [];
		if(!Game.customMinigameOnLoad) Game.customMinigameOnLoad = {};
		for(key in Game.Objects) if(!Game.customMinigameOnLoad[key]) Game.customMinigameOnLoad[key] = [];
		
		CCSE.SliceCodeIntoFunction('Game.scriptLoaded', -1, `
			// Game.scriptLoaded injection point 0
			for(var i in Game.customScriptLoaded) Game.customScriptLoaded[i](who, script); // Who knows, maybe those arguments might be needed
			for(var i in Game.customMinigameOnLoad[who.name]) Game.customMinigameOnLoad[who.name][i](who, script);
		`);
		
		
		// -----     Upgrades block     ----- //
		
		// Game.storeBuyAll
		if(!Game.customStoreBuyAll) Game.customStoreBuyAll = [];
		CCSE.SliceCodeIntoFunction('Game.storeBuyAll', -1, `
			// Game.storeBuyAll injection point 0
			for(var i in Game.customStoreBuyAll) Game.customStoreBuyAll[i]();
		`);
		
		
		// Game.CountsAsUpgradeOwned
		// Return ret to have no effect
		if(!Game.customCountsAsUpgradeOwned) Game.customCountsAsUpgradeOwned = [];
		CCSE.SpliceCodeIntoFunction('Game.CountsAsUpgradeOwned', 2, 'var ret;');
		CCSE.ReplaceCodeIntoFunction('Game.CountsAsUpgradeOwned', /return/g, 'ret =', 0);
		CCSE.SliceCodeIntoFunction('Game.CountsAsUpgradeOwned', -1, `
			// Game.CountsAsUpgradeOwned injection point 0
			for(var i in Game.customCountsAsUpgradeOwned) ret = Game.customCountsAsUpgradeOwned[i](pool, ret);
			return ret;
		`);
		
		
		// Game.Unlock
		if(!Game.customUnlock) Game.customUnlock = [];
		CCSE.SliceCodeIntoFunction('Game.Unlock', -1, `
			// Game.Unlock injection point 0
			for(var i in Game.customUnlock) Game.customUnlock[i](what);
		`);
		
		
		// Game.Lock
		if(!Game.customLock) Game.customLock = [];
		CCSE.SliceCodeIntoFunction('Game.Lock', -1, `
			// Game.Lock injection point 0
			for(var i in Game.customLock) Game.customLock[i](what);
		`);
		
		
		// Game.RebuildUpgrades
		if(!Game.customRebuildUpgrades) Game.customRebuildUpgrades = [];
		CCSE.SliceCodeIntoFunction('Game.RebuildUpgrades', -1, `
			// Game.RebuildUpgrades injection point 0
			for(var i in Game.customRebuildUpgrades) Game.customRebuildUpgrades[i]();
		`);
		
		
		// Game.GetTieredCpsMult
		// Functions should return a value to multiply mult by (Return 1 to have no effect)
		if(!Game.customGetTieredCpsMult) Game.customGetTieredCpsMult = [];
		CCSE.ReplaceCodeIntoFunction('Game.GetTieredCpsMult', 'return', `
			// Game.GetTieredCpsMult injection point 0
			for(var i in Game.customGetTieredCpsMult) mult *= Game.customGetTieredCpsMult[i](me);`, -1);
		
		
		// Game.UnlockTiered
		if(!Game.customUnlockTiered) Game.customUnlockTiered = [];
		CCSE.SliceCodeIntoFunction('Game.UnlockTiered', -1, `
			// Game.UnlockTiered injection point 0
			for(var i in Game.customUnlockTiered) Game.customUnlockTiered[i](me);
		`);
		
		
		// Game.SetResearch
		if(!Game.customSetResearch) Game.customSetResearch = [];
		CCSE.SliceCodeIntoFunction('Game.SetResearch', -1, `
			// Game.SetResearch injection point 0
			for(var i in Game.customSetResearch) Game.customSetResearch[i](what, time);
		`);
		
		
		// Game.DropEgg
		// Functions should return a value to multiply failRate by (Return 1 to have no effect)
		if(!Game.customDropEgg) Game.customDropEgg = [];
		CCSE.SpliceCodeIntoFunction('Game.DropEgg', 2, 
			`// Game.DropEgg injection point 0
			for(var i in Game.customDropEgg) failRate *= Game.customDropEgg[i]();`);
		
		
		// Game.AssignPermanentSlot
		// Don't know where to put the hook. If you have a good idea, let me know.
		
		
		// Game.PutUpgradeInPermanentSlot
		if(!Game.customPutUpgradeInPermanentSlot) Game.customPutUpgradeInPermanentSlot = [];
		CCSE.SliceCodeIntoFunction('Game.PutUpgradeInPermanentSlot', -1, `
			// Game.PutUpgradeInPermanentSlot injection point 0
			for(var i in Game.customPutUpgradeInPermanentSlot) Game.customPutUpgradeInPermanentSlot[i](upgrade, slot);
		`);
		
		
		// Game.loseShimmeringVeil
		if(!Game.customLoseShimmeringVeil) Game.customLoseShimmeringVeil = [];
		CCSE.SliceCodeIntoFunction('Game.loseShimmeringVeil', -1, `
			// Game.loseShimmeringVeil injection point 0
			for(var i in Game.customLoseShimmeringVeil) Game.customLoseShimmeringVeil[i](context);
		`);
		
		
		// Game.listTinyOwnedUpgrades
		if(!Game.customListTinyOwnedUpgrades) Game.customListTinyOwnedUpgrades = [];
		CCSE.ReplaceCodeIntoFunction('Game.listTinyOwnedUpgrades', 'return', `
			// Game.listTinyOwnedUpgrades injection point 0
			for(var i in Game.customListTinyOwnedUpgrades) str = Game.customListTinyOwnedUpgrades[i](arr, str);`, -1);
		
		
		// Game.TieredUpgrade
		CCSE.ReplaceCodeIntoFunction('Game.TieredUpgrade', 'new Game.Upgrade', 'CCSE.NewUpgrade', 0);
		
		
		// Game.SynergyUpgrade
		CCSE.ReplaceCodeIntoFunction('Game.SynergyUpgrade', 'new Game.Upgrade', 'CCSE.NewUpgrade', 0);
		
		
		// Game.GrandmaSynergy
		CCSE.ReplaceCodeIntoFunction('Game.GrandmaSynergy', 'new Game.Upgrade', 'CCSE.NewUpgrade', 0);
		
		
		// Game.NewUpgradeCookie
		CCSE.ReplaceCodeIntoFunction('Game.NewUpgradeCookie', 'new Game.Upgrade', 'CCSE.NewUpgrade', 0);
		
		
		// -----     Seasons block     ----- //
		
		// Game.computeSeasons
		CCSE.ReplaceCodeIntoFunction('Game.computeSeasons', "else Game.Notify(str,'',this.icon,4);", `
					// Game.computeSeasons injection point 0
					for(var i in Game.customUpgrades[this.name].buyFunction) Game.customUpgrades[this.name].buyFunction[i](this);`, 1);
		
		
		// Game.getSeasonDuration
		// Just rewrote it instead of doing the eval replace thing
		// Functions should return a multiplier to the season duration
		// Return 1 to have no effect
		if(!Game.customGetSeasonDuration) Game.customGetSeasonDuration = []; 
		Game.getSeasonDuration = function(){
			var ret = Game.fps*60*60*24;
			// Game.getSeasonDuration injection point 0
			for(var i in Game.customGetSeasonDuration) ret *= Game.customGetSeasonDuration[i]();
			return ret;
		}
		
		
		// -----     Achievements block     ----- //
		
		// Game.Win
		if(!Game.customWin) Game.customWin = [];
		CCSE.SliceCodeIntoFunction('Game.Win', -1, `
			// Game.Win injection point 0
			for(var i in Game.customWin) Game.customWin[i](what);
		`);
		
		
		// Game.TieredAchievement
		CCSE.ReplaceCodeIntoFunction('Game.TieredAchievement', 'new Game.Achievement', 'CCSE.NewAchievement', 0);
		
		
		// Game.ProductionAchievement
		CCSE.ReplaceCodeIntoFunction('Game.ProductionAchievement', 'new Game.Achievement', 'CCSE.NewAchievement', 0);
		
		
		// Game.BankAchievement
		CCSE.ReplaceCodeIntoFunction('Game.BankAchievement', 'new Game.Achievement', 'CCSE.NewAchievement', 0);
		
		
		// Game.CpsAchievement
		CCSE.ReplaceCodeIntoFunction('Game.CpsAchievement', 'new Game.Achievement', 'CCSE.NewAchievement', 0);
		
		
		// -----     Buffs block     ----- //
		
		// Game.gainBuff
		if(!Game.customGainBuff) Game.customGainBuff = [];
		CCSE.ReplaceCodeIntoFunction('Game.gainBuff', 'return', `
			// Game.gainBuff injection point 0
			for(var i in Game.customGainBuff) Game.customGainBuff[i](buff);`, -1);
		
		
		// Game.updateBuffs
		// executed every logic frame
		if(!Game.customUpdateBuffs) Game.customUpdateBuffs = [];
		CCSE.SliceCodeIntoFunction('Game.updateBuffs', -1, `
			// Game.updateBuffs injection point 0
			for(var i in Game.customUpdateBuffs) Game.customUpdateBuffs[i]();
		`);
		
		
		for(var i in Game.buffTypes){
			var buff = Game.buffTypes[i];
			if(buff.name == 'building buff'){
				CCSE.ReplaceCodeIntoFunction('Game.buffTypes[' + i + '].func', 
					'icon:[obj.iconColumn,14],', 
					'icon:[obj.iconColumn,14,(obj.art.customIconsPic ? obj.art.customIconsPic : 0)],', 0);
			}
			else if(buff.name == 'building debuff'){
				CCSE.ReplaceCodeIntoFunction('Game.buffTypes[' + i + '].func', 
					'icon:[obj.iconColumn,15],', 
					'icon:[obj.iconColumn,15,(obj.art.customIconsPic ? obj.art.customIconsPic : 0)],', 0);
			}
		}
		
		
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
		CCSE.SliceCodeIntoFunction('Game.UpdateGrandmapocalypse', -1, `
			// Game.UpdateGrandmapocalypse injection point 0
			for(var i in Game.customUpdateGrandmapocalypse) Game.customUpdateGrandmapocalypse[i]();
		`);
		
		
		// Game.getWrinklersMax
		// Functions should return a value to add to n. Return 0 to have no effect
		if(!Game.customGetWrinklersMax) Game.customGetWrinklersMax = [];
		CCSE.ReplaceCodeIntoFunction('Game.getWrinklersMax', 'return', `
			// Game.getWrinklersMax injection point 0
			for(var i in Game.customGetWrinklersMax) n += Game.customGetWrinklersMax[i](n);`, -1);
		
		
		// Game.SpawnWrinkler
		if(!Game.customSpawnWrinkler) Game.customSpawnWrinkler = [];
		CCSE.ReplaceCodeIntoFunction('Game.SpawnWrinkler', 'return me', `
			// Game.SpawnWrinkler injection point 0
			for(var i in Game.customSpawnWrinkler) Game.customSpawnWrinkler[i](me);`, -1);
		
		
		// Game.UpdateWrinklers
		// customWrinklerSpawnChance functions should return a multiplier to chance. (Return 1 to have no effect)
		if(!Game.customUpdateWrinklers) Game.customUpdateWrinklers = [];
		if(!Game.customWrinklerSpawnChance) Game.customWrinklerSpawnChance = [];
		if(!Game.customWrinklerPop) Game.customWrinklerPop = [];
		CCSE.ReplaceCodeIntoFunction('Game.UpdateWrinklers', 'if (Math.random()<chance)', `
					// Game.UpdateWrinklers injection point 0
					for(var i in Game.customWrinklerSpawnChance) chance *= Game.customWrinklerSpawnChance[i]();`, -1);
		CCSE.ReplaceCodeIntoFunction('Game.UpdateWrinklers', 'Game.Earn(me.sucked);', `
					// Game.UpdateWrinklers injection point 1
					for(var i in Game.customWrinklerPop) Game.customWrinklerPop[i](me);`, -1);
		CCSE.SliceCodeIntoFunction('Game.UpdateWrinklers', -1, `
			// Game.UpdateWrinklers injection point 2
			for(var i in Game.customUpdateWrinklers) Game.customUpdateWrinklers[i]();
		`, inRect.toString());
		
		
		// Game.DrawWrinklers
		if(!Game.customDrawWrinklers) Game.customDrawWrinklers = [];
		CCSE.SliceCodeIntoFunction('Game.DrawWrinklers', -1, `
			// Game.DrawWrinklers injection point 0
			for(var i in Game.customDrawWrinklers) Game.customDrawWrinklers[i]();
		`);
		
		
		// Game.SaveWrinklers
		// Return ret to have no effect
		if(!Game.customSaveWrinklers) Game.customSaveWrinklers = [];
		CCSE.ReplaceCodeIntoFunction('Game.SaveWrinklers', 'return', `
			// Game.SaveWrinklers injection point 0
			var ret =`, 0);
		CCSE.SliceCodeIntoFunction('Game.SaveWrinklers', -1, `
			// Game.SaveWrinklers injection point 1
			for(var i in Game.customSaveWrinklers) ret = Game.customSaveWrinklers[i](ret);
			return ret;
		`);
		
		
		// Game.LoadWrinklers
		if(!Game.customLoadWrinklers) Game.customLoadWrinklers = [];
		CCSE.SliceCodeIntoFunction('Game.LoadWrinklers', -1, `
			// Game.LoadWrinklers injection point 0
			for(var i in Game.customLoadWrinklers) Game.customLoadWrinklers[i](amount, number, shinies, amountShinies);
		`);
		
		
		// -----     Special things and stuff block     ----- //
		
		// Game.UpdateSpecial
		// customSpecialTabs functions should push a string to Game.specialTabs (or not)
		if(!Game.customSpecialTabs) Game.customSpecialTabs = [];
		CCSE.ReplaceCodeIntoFunction('Game.UpdateSpecial', 'if (Game.specialTabs.length==0)', 
			`// Game.UpdateSpecial injection point 0
			for(var i in Game.customSpecialTabs) Game.customSpecialTabs[i]();`, -1);
		
		
		// Game.UpgradeSanta
		if(!Game.customUpgradeSanta) Game.customUpgradeSanta = [];
		CCSE.SliceCodeIntoFunction('Game.UpgradeSanta', -1, `
			// Game.UpgradeSanta injection point 0
			for(var i in Game.customUpgradeSanta) Game.customUpgradeSanta[i]();
		`);
		
		
		// Game.hasAura
		// Return ret to have no effect
		if(!Game.customHasAura) Game.customHasAura = [];
		CCSE.SpliceCodeIntoFunction('Game.hasAura', 2, 'var ret;');
		CCSE.ReplaceCodeIntoFunction('Game.hasAura', /return/g, 'ret =', 0);
		CCSE.SliceCodeIntoFunction('Game.hasAura', -1, `
			// Game.hasAura injection point 0
			for(var i in Game.customHasAura) ret = Game.customHasAura[i](what, ret);
			return ret;
		`);
		
		
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
		CCSE.SliceCodeIntoFunction('Game.DescribeDragonAura', -1, `
			// Game.DescribeDragonAura injection point 0
			for(var i in Game.customDescribeDragonAura) Game.customDescribeDragonAura[i](aura);
		`);
		
		
		// Game.UpgradeDragon
		if(!Game.customUpgradeDragon) Game.customUpgradeDragon = [];
		CCSE.SliceCodeIntoFunction('Game.UpgradeDragon', -1, `
			// Game.UpgradeDragon injection point 0
			for(var i in Game.customUpgradeDragon) Game.customUpgradeDragon[i]();
		`);
		
		
		// Game.ToggleSpecialMenu
		// customToggleSpecialMenu functions should return a string for l('specialPopup').innerHTML (Return str for no effect)
		// str.replace('background:url(img/dragon.png?v='+Game.version+');background-position:-384px 0px;', <your pic here>)
		// Pics are 96px by 96px
		if(!Game.customToggleSpecialMenu) Game.customToggleSpecialMenu = [];
		CCSE.ReplaceCodeIntoFunction('Game.ToggleSpecialMenu', "l('specialPopup').innerHTML=str;", 
			`// Game.ToggleSpecialMenu injection point 0
			for(var i in Game.customToggleSpecialMenu) str = Game.customToggleSpecialMenu[i](str);`, -1);
		
		
		// Game.DrawSpecial
		// customDrawSpecialPic functions should alter the picframe object
		// Pics are 96px by 96px
		if(!Game.customDrawSpecial) Game.customDrawSpecial = [];
		if(!Game.customDrawSpecialPic) Game.customDrawSpecialPic = [];
		CCSE.ReplaceCodeIntoFunction('Game.DrawSpecial', "if (hovered || selected)", 
			`// Game.DrawSpecial injection point 0
				var picframe = {pic:pic, frame:frame};
				for(var j in Game.customDrawSpecialPic) Game.customDrawSpecialPic[j](picframe, Game.specialTabs[i]);
				pic = picframe.pic; frame = picframe.frame;`, -1);
		CCSE.SliceCodeIntoFunction('Game.DrawSpecial', -1, `
			// Game.DrawSpecial injection point 1
			for(var i in Game.customDrawSpecial) Game.customDrawSpecial[i]();
		`);
		
		
		// -----     Visual Effects block     ----- //
		
		// Game.DrawBackground
		// Game.customDrawBackground functions get called in the same block that creates the cookie rain and seasonal backgrounds 
		// If you want a hook somewhere else, let me know
		if(!Game.customDrawBackground) Game.customDrawBackground = [];
		CCSE.ReplaceCodeIntoFunction('Game.DrawBackground', "Timer.track('left background');", 
			`// Game.DrawBackground injection point 0
			for(var i in Game.customDrawBackground) Game.customDrawBackground[i]();`, -1);
		
		
		// -----     Debug block     ----- //
		
		// Game.OpenSesame
		// Game.customOpenSesame functions should add HTML strings to the debug menu
		if(!Game.customOpenSesame) Game.customOpenSesame = [];
		CCSE.ReplaceCodeIntoFunction('Game.OpenSesame', "str+='</div>';", 
			`// Game.OpenSesame injection point 0
			for(var i in Game.customOpenSesame) str += Game.customOpenSesame[i]();`, -1);
		
		
	}
	
	if(!CCSE.customReplaceShimmerType) CCSE.customReplaceShimmerType = [];
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
		CCSE.ReplaceCodeIntoFunction("Game.shimmerTypes['" + escKey + "'].initFunc", 'me.dur=dur;', 
					`// Game.shimmerTypes['` + escKey + `'].initFunc injection point 0
					for(var i in Game.customShimmerTypes['` + escKey + `'].durationMult) dur *= Game.customShimmerTypes['` + escKey + `'].durationMult[i]();`, -1);
		CCSE.SliceCodeIntoFunction("Game.shimmerTypes['" + escKey + "'].initFunc", -1, `
					// Game.shimmerTypes['` + escKey + `'].initFunc injection point 1
					for(var i in Game.customShimmerTypes['` + escKey + `'].initFunc) Game.customShimmerTypes['` + escKey + `'].initFunc[i]();
				`);
		
		
		// Game.shimmerTypes[key].updateFunc
		if(!Game.customShimmerTypes[key].updateFunc) Game.customShimmerTypes[key].updateFunc = [];
		Game.customShimmerTypes[key].updateFunc.push(CCSE.customShimmerTypesAllupdateFunc);
		CCSE.SliceCodeIntoFunction("Game.shimmerTypes['" + escKey + "'].updateFunc", -1, `
					// Game.shimmerTypes['` + escKey + `'].updateFunc injection point 0
					for(var i in Game.customShimmerTypes['` + escKey + `'].updateFunc) Game.customShimmerTypes['` + escKey + `'].updateFunc[i]();
				`);
		
		
		// Game.shimmerTypes[key].popFunc
		if(!Game.customShimmerTypes[key].popFunc) Game.customShimmerTypes[key].popFunc = [];
		Game.customShimmerTypes[key].popFunc.push(CCSE.customShimmerTypesAllpopFunc);
		CCSE.SliceCodeIntoFunction("Game.shimmerTypes['" + escKey + "'].popFunc", -1, `
					// Game.shimmerTypes['` + escKey + `'].popFunc injection point 0
					for(var i in Game.customShimmerTypes['` + escKey + `'].popFunc) Game.customShimmerTypes['` + escKey + `'].popFunc[i]();
				`);
		
		
		// Game.shimmerTypes[key].spawnConditions
		// Return ret to have no effect 
		if(!Game.customShimmerTypes[key].spawnConditions) Game.customShimmerTypes[key].spawnConditions = [];
		Game.customShimmerTypes[key].spawnConditions.push(CCSE.customShimmerTypesAllspawnConditions);
		CCSE.SpliceCodeIntoFunction("Game.shimmerTypes['" + escKey + "'].spawnConditions", 2, 'var ret;');
		CCSE.ReplaceCodeIntoFunction("Game.shimmerTypes['" + escKey + "'].spawnConditions", /return/g, 'ret =', 0);
		CCSE.SliceCodeIntoFunction("Game.shimmerTypes['" + escKey + "'].spawnConditions", -1, `
					// Game.shimmerTypes['` + escKey + `'].spawnConditions injection point 0
					for(var i in Game.customShimmerTypes['` + escKey + `'].spawnConditions) ret = Game.customShimmerTypes['` + escKey + `'].spawnConditions[i](ret);
					return ret;
				`);
		
		
		// Game.shimmerTypes[key].getTimeMod
		// Functions should return a multiplier to the shimmer's spawn time (higher takes longer to spawn)
		// Return 1 to have no effect 
		if(!Game.customShimmerTypes[key].getTimeMod) Game.customShimmerTypes[key].getTimeMod = [];
		Game.customShimmerTypes[key].getTimeMod.push(CCSE.customShimmerTypesAllgetTimeMod);
		CCSE.ReplaceCodeIntoFunction("Game.shimmerTypes['" + escKey + "'].getTimeMod", 'return', `
					// Game.shimmerTypes['` + escKey + `'].getTimeMod injection point 0
					for(var i in Game.customShimmerTypes['` + escKey + `'].getTimeMod) m *= Game.customShimmerTypes['` + escKey + `'].getTimeMod[i](me);`, -1);
		
		
		for(var i in CCSE.customReplaceShimmerType) CCSE.customReplaceShimmerType[i](key);
	}
	
	if(!CCSE.customReplaceBuilding) CCSE.customReplaceBuilding = [];
	CCSE.ReplaceBuildingsStart = function(){
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
		CCSE.i = 0;
	}
	
	CCSE.ReplaceBuildings = function(){
		var time = Date.now();
		
		for(var i = CCSE.i; i < Game.ObjectsN; i++){
			CCSE.ReplaceBuilding(Game.ObjectsById[i].name);
			if(Date.now() > time + 500 / Game.fps) break;
		}
		
		CCSE.i = i + 1;
		if(CCSE.i < Game.ObjectsN){
			// Didn't do all of them. Wait for priority and go again
			requestAnimationFrame(CCSE.ReplaceBuildings);
		}else{
			// Continue on
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		}
	}
	
	CCSE.ReplaceBuildingsFinish = function(){
		
		// -----     Individual Buildings block     ----- //
		
		var obj = Game.Objects['Cursor'];
		// Cursor.cps
		// cpsAdd Functions should return a value to add per non cursor building (Return 0 to have no effect)
		if(!Game.customBuildings[obj.name].cpsAdd) Game.customBuildings[obj.name].cpsAdd = [];
		if(!Game.customBuildings[obj.name].cpsMult) Game.customBuildings[obj.name].cpsMult = [];
		CCSE.ReplaceCodeIntoFunction("Game.Objects['Cursor'].cps", 'var mult=1;', `
			// Cursor.cps injection point 1
			for(var i in Game.customBuildings['` + obj.name + `'].cpsAdd) add += Game.customBuildings['` + obj.name + `'].cpsAdd[i](me);`, -1);
		
		
		obj = Game.Objects['Grandma'];
		// Grandma.art.pic
		// Functions should push an image name (sans the .png part) into list
		if(!Game.customGrandmaPicture) Game.customGrandmaPicture = [];
		CCSE.ReplaceCodeIntoFunction("Game.Objects['Grandma'].art.pic", 'return', `
			// Grandma.art.pic injection point 0
			for(var j in Game.customGrandmaPicture) Game.customGrandmaPicture[j](i, list);`, -1);
		
		
		// Grandma.cps
		// cpsAdd Functions should return a value to add before multiplying (Return 0 to have no effect)
		if(!Game.customBuildings[obj.name].cpsAdd) Game.customBuildings[obj.name].cpsAdd = [];
		if(!Game.customBuildings[obj.name].cpsMult) Game.customBuildings[obj.name].cpsMult = [];
		CCSE.ReplaceCodeIntoFunction("Game.Objects['Grandma'].cps", 'return', `
			// Grandma.cps injection point 1
			for(var i in Game.customBuildings['` + obj.name + `'].cpsAdd) add += Game.customBuildings['` + obj.name + `'].cpsAdd[i](me);`, -1);
		
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
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].switchMinigame", -1, `
				// Game.Objects['` + escKey + `'].switchMinigame injection point 0
				for(var i in Game.customBuildings[this.name].switchMinigame) Game.customBuildings[this.name].switchMinigame[i](this, on);
			`);
		
		
		// this.getSellMultiplier
		// Return ret to have no effect
		if(!Game.customBuildings[key].getSellMultiplier) Game.customBuildings[key].getSellMultiplier = [];
		Game.customBuildings[key].getSellMultiplier.push(CCSE.customBuildingsAllgetSellMultiplier);
		CCSE.ReplaceCodeIntoFunction("Game.Objects['" + escKey + "'].getSellMultiplier", 'return', `
				// Game.Objects['` + escKey + `'].getSellMultiplier injection point 0
				for(var i in Game.customBuildings[this.name].getSellMultiplier) giveBack = Game.customBuildings[this.name].getSellMultiplier[i](this, giveBack);`, -1);
		
		
		// this.buy
		if(!Game.customBuildings[key].buy) Game.customBuildings[key].buy = [];
		Game.customBuildings[key].buy.push(CCSE.customBuildingsAllbuy);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].buy", -1, `
				// Game.Objects['` + escKey + `'].buy injection point 0
				for(var i in Game.customBuildings[this.name].buy) Game.customBuildings[this.name].buy[i](this, amount);
			`);
		
		
		// this.sell
		if(!Game.customBuildings[key].sell) Game.customBuildings[key].sell = [];
		Game.customBuildings[key].sell.push(CCSE.customBuildingsAllsell);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].sell", -1, `
				// Game.Objects['` + escKey + `'].sell injection point 0
				for(var i in Game.customBuildings[this.name].sell) Game.customBuildings[this.name].sell[i](this, amount, bypass);
			`);
		
		
		// this.sacrifice
		if(!Game.customBuildings[key].sacrifice) Game.customBuildings[key].sacrifice = [];
		Game.customBuildings[key].sacrifice.push(CCSE.customBuildingsAllsacrifice);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].sacrifice", -1, `
				// Game.Objects['` + escKey + `'].sacrifice injection point 0
				for(var i in Game.customBuildings[this.name].sacrifice) Game.customBuildings[this.name].sacrifice[i](this, amount);
			`);
		
		
		// this.buyFree
		if(!Game.customBuildings[key].buyFree) Game.customBuildings[key].buyFree = [];
		Game.customBuildings[key].buyFree.push(CCSE.customBuildingsAllbuyFree);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].buyFree", -1, `
				// Game.Objects['` + escKey + `'].buyFree injection point 0
				for(var i in Game.customBuildings[this.name].buyFree) Game.customBuildings[this.name].buyFree[i](this, amount);
			`, 'var price = Game.Objects["' + escKey + '"].basePrice');
		
		
		// this.getFree
		if(!Game.customBuildings[key].getFree) Game.customBuildings[key].getFree = [];
		Game.customBuildings[key].getFree.push(CCSE.customBuildingsAllgetFree);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].getFree", -1, `
				// Game.Objects['` + escKey + `'].getFree injection point 0
				for(var i in Game.customBuildings[this.name].getFree) Game.customBuildings[this.name].getFree[i](this, amount);
			`);
		
		
		// this.getFreeRanks
		if(!Game.customBuildings[key].getFreeRanks) Game.customBuildings[key].getFreeRanks = [];
		Game.customBuildings[key].getFreeRanks.push(CCSE.customBuildingsAllgetFreeRanks);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].getFreeRanks", -1, `
				// Game.Objects['` + escKey + `'].getFreeRanks injection point 0
				for(var i in Game.customBuildings[this.name].getFreeRanks) Game.customBuildings[this.name].getFreeRanks[i](this, amount);
			`);
		
		
		// this.tooltip
		// Return ret to have no effect
		if(!Game.customBuildings[key].tooltip) Game.customBuildings[key].tooltip = []; 
		Game.customBuildings[key].tooltip.push(CCSE.customBuildingsAlltooltip);
		CCSE.ReplaceCodeIntoFunction("Game.Objects['" + escKey + "'].tooltip", 'return', 'var ret =', 0);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].tooltip", -1, `
				// Game.Objects['` + escKey + `'].tooltip injection point 0
				for(var i in Game.customBuildings[this.name].tooltip) ret = Game.customBuildings[this.name].tooltip[i](this, ret);
				return ret;
			`);
		
		
		// this.levelTooltip
		// Return ret to have no effect
		if(!Game.customBuildings[key].levelTooltip) Game.customBuildings[key].levelTooltip = []; 
		Game.customBuildings[key].levelTooltip.push(CCSE.customBuildingsAlllevelTooltip);
		CCSE.ReplaceCodeIntoFunction("Game.Objects['" + escKey + "'].levelTooltip", 'return', 'var ret =', 0);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].levelTooltip", -1, `
				// Game.Objects['` + escKey + `'].levelTooltip injection point 0
				for(var i in Game.customBuildings[this.name].levelTooltip) ret = Game.customBuildings[this.name].levelTooltip[i](this, ret);
				return ret;
			`);
		
		
		// this.levelUp
		// Haha no. This is like four functions that return each other
		// I'm not dealing with it unless I have to.
		
		
		// this.refresh
		if(!Game.customBuildings[key].refresh) Game.customBuildings[key].refresh = [];
		Game.customBuildings[key].refresh.push(CCSE.customBuildingsAllrefresh);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].refresh", -1, `
				// Game.Objects['` + escKey + `'].refresh injection point 0
				for(var i in Game.customBuildings[this.name].refresh) Game.customBuildings[this.name].refresh[i](this);
			`);
		
		
		// this.rebuild
		if(!Game.customBuildings[key].rebuild) Game.customBuildings[key].rebuild = [];
		Game.customBuildings[key].rebuild.push(CCSE.customBuildingsAllrebuild);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].rebuild", -1, `
				// Game.Objects['` + escKey + `'].rebuild injection point 0
				for(var i in Game.customBuildings[this.name].rebuild) Game.customBuildings[this.name].rebuild[i](this);
			`);
		
		
		// this.mute
		if(!Game.customBuildings[key].mute) Game.customBuildings[key].mute = [];
		Game.customBuildings[key].mute.push(CCSE.customBuildingsAllmute);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].mute", -1, `
				// Game.Objects['` + escKey + `'].mute injection point 0
				for(var i in Game.customBuildings[this.name].mute) Game.customBuildings[this.name].mute[i](this, val);
			`);
		
		
		// this.draw
		if(!Game.customBuildings[key].draw) Game.customBuildings[key].draw = [];
		Game.customBuildings[key].draw.push(CCSE.customBuildingsAlldraw);
		if(key == 'Cursor'){ // Because cursors are special
			Game.Objects[key].draw = function(){
				// Game.Objects['Cursor'].draw injection point 0
				for(var i in Game.customBuildings[this.name].draw) Game.customBuildings[this.name].draw[i](this);
			}
		}
		else{
			CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].draw", -1, `
				// Game.Objects['` + escKey + `'].draw injection point 0
				for(var i in Game.customBuildings[this.name].draw) Game.customBuildings[this.name].draw[i](this);
			`);
		}
		
		
		
		// this.buyFunction
		if(!Game.customBuildings[key].buyFunction) Game.customBuildings[key].buyFunction = [];
		Game.customBuildings[key].buyFunction.push(CCSE.customBuildingsAllbuyFunction);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].buyFunction", -1, `
				// Game.Objects['` + escKey + `'].buyFunction injection point 0
				for(var i in Game.customBuildings[this.name].buyFunction) Game.customBuildings[this.name].buyFunction[i](this);
			`);
		
		
		// this.cps
		// cpsMult Functions should return a value to multiply the price by (Return 1 to have no effect)
		if(!Game.customBuildings[obj.name].cpsMult) Game.customBuildings[obj.name].cpsMult = [];
		Game.customBuildings[key].cpsMult.push(CCSE.customBuildingsAllcpsMult);
		CCSE.SliceCodeIntoFunction("Game.Objects['" + escKey + "'].cps", -1, `
				// Game.Objects['` + escKey + `'].cps injection point 0
				for(var i in Game.customBuildings[this.name].cpsMult) mult *= Game.customBuildings[this.name].cpsMult[i](me);
			`);
		
		
		for(var i in CCSE.customReplaceBuilding) CCSE.customReplaceBuilding[i](key, obj);
	}
	
	if(!CCSE.customReplaceUpgrade) CCSE.customReplaceUpgrade = [];
	CCSE.ReplaceUpgradesStart = function(){
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
		
		if(!Game.customUpgradesAll.descFunc) Game.customUpgradesAll.descFunc = [];
		CCSE.customUpgradesAlldescFunc = function(me, desc){
			for(var i in Game.customUpgradesAll.descFunc) desc = Game.customUpgradesAll.descFunc[i](me, desc);
			return desc;
		}
		
		
		if(!Game.customUpgrades) Game.customUpgrades = {};
		CCSE.Backup.customUpgrades = {};
		CCSE.i = 0;
	}
	
	CCSE.ReplaceUpgrades = function(){
		var time = Date.now();
		
		for(var i = CCSE.i; i < Game.UpgradesN; i++){
			CCSE.ReplaceUpgrade(Game.UpgradesById[i].name);
			if(Date.now() > time + 500 / Game.fps) break;
		}
		
		CCSE.i = i + 1;
		if(CCSE.i < Game.UpgradesN){
			// Didn't do all of them. Wait for priority and go again
			requestAnimationFrame(CCSE.ReplaceUpgrades);
		}else{
			// Continue on
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		}
	}
	
	CCSE.ReplaceUpgradesFinish = function(){
		// Correct these descFuncs
		var slots=['Permanent upgrade slot I','Permanent upgrade slot II','Permanent upgrade slot III','Permanent upgrade slot IV','Permanent upgrade slot V'];
		for (var i=0;i<slots.length;i++)
		{
			Game.Upgrades[slots[i]].olddescFunc=function(i){return function(){
				if (Game.permanentUpgrades[i]==-1) return Game.Upgrades[slots[i]].desc;
				var upgrade=Game.UpgradesById[Game.permanentUpgrades[i]];
				return '<div style="text-align:center;">'+'Current : <div class="icon" style="vertical-align:middle;display:inline-block;'+(upgrade.icon[2]?'background-image:url('+upgrade.icon[2]+');':'')+'background-position:'+(-upgrade.icon[0]*48)+'px '+(-upgrade.icon[1]*48)+'px;transform:scale(0.5);margin:-16px;"></div> <b>'+upgrade.name+'</b><div class="line"></div></div>'+Game.Upgrades[slots[i]].desc;
			};}(i);
		}
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
		CCSE.ReplaceCodeIntoFunction("Game.Upgrades['" + escKey + "'].getPrice", 'return Math', `
			// Game.Upgrades['` + escKey + `'].getPrice injection point 0
			for(var i in Game.customUpgrades[this.name].getPrice) price *= Game.customUpgrades[this.name].getPrice[i](this);`, -1);
		
		
		// this.click
		if(!Game.customUpgrades[key].click) Game.customUpgrades[key].click = [];
		Game.customUpgrades[key].click.push(CCSE.customUpgradesAllclick);
		CCSE.SliceCodeIntoFunction("Game.Upgrades['" + escKey + "'].click", -1, `
				// Game.Upgrades['` + escKey + `'].click injection point 0
				for(var i in Game.customUpgrades[this.name].click) Game.customUpgrades[this.name].click[i](this, e);
			`);
		
		
		// this.buy
		if(!Game.customUpgrades[key].buy) Game.customUpgrades[key].buy = []; 
		Game.customUpgrades[key].buy.push(CCSE.customUpgradesAllbuy);
		CCSE.ReplaceCodeIntoFunction("Game.Upgrades['" + escKey + "'].buy", 'return', `
			// Game.Upgrades['` + escKey + `'].buy injection point 0
			for(var i in Game.customUpgrades[this.name].buy) Game.customUpgrades[this.name].buy[i](this, bypass, success);`, -1);
		
		
		// this.earn 
		if(!Game.customUpgrades[key].earn) Game.customUpgrades[key].earn = [];
		Game.customUpgrades[key].earn.push(CCSE.customUpgradesAllearn);
		CCSE.SliceCodeIntoFunction("Game.Upgrades['" + escKey + "'].earn", -1, `
				// Game.Upgrades['` + escKey + `'].earn injection point 0
				for(var i in Game.customUpgrades[this.name].earn) Game.customUpgrades[this.name].earn[i](this);
			`);
		
		
		// this.unearn
		if(!Game.customUpgrades[key].unearn) Game.customUpgrades[key].unearn = [];
		Game.customUpgrades[key].unearn.push(CCSE.customUpgradesAllunearn);
		CCSE.SliceCodeIntoFunction("Game.Upgrades['" + escKey + "'].unearn", -1, `
				// Game.Upgrades['` + escKey + `'].unearn injection point 0
				for(var i in Game.customUpgrades[this.name].unearn) Game.customUpgrades[this.name].unearn[i](this);
			`);
		
		
		// this.unlock
		if(!Game.customUpgrades[key].unlock) Game.customUpgrades[key].unlock = [];
		Game.customUpgrades[key].unlock.push(CCSE.customUpgradesAllunlock);
		CCSE.SliceCodeIntoFunction("Game.Upgrades['" + escKey + "'].unlock", -1, `
				// Game.Upgrades['` + escKey + `'].unlock injection point 0
				for(var i in Game.customUpgrades[this.name].unlock) Game.customUpgrades[this.name].unlock[i](this);
			`);
		
		
		// this.lose
		if(!Game.customUpgrades[key].lose) Game.customUpgrades[key].lose = [];
		Game.customUpgrades[key].lose.push(CCSE.customUpgradesAlllose);
		CCSE.SliceCodeIntoFunction("Game.Upgrades['" + escKey + "'].lose", -1, `
				// Game.Upgrades['` + escKey + `'].lose injection point 0
				for(var i in Game.customUpgrades[this.name].lose) Game.customUpgrades[this.name].lose[i](this);
			`);
		
		
		// this.toggle
		if(!Game.customUpgrades[key].toggle) Game.customUpgrades[key].toggle = [];
		Game.customUpgrades[key].toggle.push(CCSE.customUpgradesAlltoggle);
		CCSE.SliceCodeIntoFunction("Game.Upgrades['" + escKey + "'].toggle", -1, `
				// Game.Upgrades['` + escKey + `'].toggle injection point 0
				for(var i in Game.customUpgrades[this.name].toggle) Game.customUpgrades[this.name].toggle[i](this);
			`);
		
		
		// this.buyFunction
		if(!Game.customUpgrades[key].buyFunction) Game.customUpgrades[key].buyFunction = [];
		Game.customUpgrades[key].buyFunction.push(CCSE.customUpgradesAllbuyFunction);
		if(upgrade.buyFunction){
			CCSE.SliceCodeIntoFunction("Game.Upgrades['" + escKey + "'].buyFunction", -1, `
				// Game.Upgrades['` + escKey + `'].buyFunction injection point 0
				for(var i in Game.customUpgrades[this.name].buyFunction) Game.customUpgrades[this.name].buyFunction[i](this);
			`);
		}else{
			upgrade.buyFunction = function(){
				// Game.Upgrades['` + escKey + `'].buyFunction injection point 0
				for(var i in Game.customUpgrades[this.name].buyFunction) Game.customUpgrades[this.name].buyFunction[i](this);
			}
			CCSE.functionsAltered++;
		}
		
		
		// this.descFunc
		// Far too disparate for my desired consistency
		if(!Game.customUpgrades[key].descFunc) Game.customUpgrades[key].descFunc = [];
		Game.customUpgrades[key].descFunc.push(CCSE.customUpgradesAlldescFunc);
		if(upgrade.descFunc){
			eval('upgrade.olddescFunc = ' + upgrade.descFunc.toString());
			upgrade.descFunc = function(){
				var desc = this.olddescFunc();
				for(var i in Game.customUpgrades[this.name].descFunc) desc = Game.customUpgrades[this.name].descFunc[i](this, desc);
				return desc;
			}
		}else{
			upgrade.descFunc = function(){
				var desc = this.desc;
				// Game.Upgrades['` + escKey + `'].descFunc injection point 0
				for(var i in Game.customUpgrades[this.name].descFunc) desc = Game.customUpgrades[this.name].descFunc[i](this, desc);
				return desc;
			}
		}
		
		for(var i in CCSE.customReplaceUpgrade) CCSE.customReplaceUpgrade[i](key, upgrade);
	}
	
	if(!CCSE.customReplaceAchievement) CCSE.customReplaceAchievement = [];
	CCSE.ReplaceAchievementsStart = function(){
		if(!Game.customAchievementsAll) Game.customAchievementsAll = {};
		
		if(!Game.customAchievementsAll.click) Game.customAchievementsAll.click = [];
		CCSE.customAchievementsAllclick = function(me){
			for(var i in Game.customAchievementsAll.click) Game.customAchievementsAll.click[i](me);
		}
		
		if(!Game.customAchievements) Game.customAchievements = {};
		CCSE.Backup.customAchievements = {};
		CCSE.i = 0;
	}
	
	CCSE.ReplaceAchievements = function(){
		var time = Date.now();
		
		for(var i = CCSE.i; i < Game.AchievementsN; i++){
			CCSE.ReplaceAchievement(Game.AchievementsById[i].name);
			if(Date.now() > time + 500 / Game.fps) break;
		}
		
		CCSE.i = i + 1;
		if(CCSE.i < Game.AchievementsN){
			// Didn't do all of them. Wait for priority and go again
			requestAnimationFrame(CCSE.ReplaceAchievements);
		}else{
			// Continue on
			requestAnimationFrame(CCSE.playlist[CCSE.track++]);
		}
	}
	
	CCSE.ReplaceAchievement = function(key){
		var escKey = key.replace(/'/g, "\\'");
		var achievement = Game.Achievements[key];
		
		if(!Game.customAchievements[key]) Game.customAchievements[key] = {};
		CCSE.Backup.customAchievements[key] = {};
		
		
		// this.click
		if(!Game.customAchievements[key].click) Game.customAchievements[key].click = [];
		Game.customAchievements[key].click.push(CCSE.customAchievementsAllclick);
		CCSE.SliceCodeIntoFunction("Game.Achievements['" + escKey + "'].click", -1, `
				// Game.Achievements['` + escKey + `'].click injection point 0
				for(var i in Game.customAchievements[this.name].click) Game.customAchievements[this.name].click[i](this);
			`);
		
		
		for(var i in CCSE.customReplaceAchievement) CCSE.customReplaceAchievement[i](key, achievement);
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
	
	CCSE.GetMenuString = function(){
		var str =	'<div class="listing"><a class="option" ' + Game.clickStr + '="CCSE.ExportSave(); PlaySound(\'snd/tick.mp3\');">Export custom save</a>' +
										 '<a class="option" ' + Game.clickStr + '="CCSE.ImportSave(); PlaySound(\'snd/tick.mp3\');">Import custom save</a>' + 
										 '<label>Back up data added by mods and managed by CCSE</label></div>';
		
		return str;
	}
	
	CCSE.PrependCollapsibleInfoMenu = function(title, body){
		// Title must be a string. Body may be either string or div
		var titleDiv = document.createElement('div');
		titleDiv.className = 'title';
		titleDiv.textContent = title + ' ';
		
		if(CCSE.collapseMenu[title + 'info'] === undefined) CCSE.collapseMenu[title + 'info'] = 0;
		
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
		span.textContent = (CCSE.collapseMenu[title + 'info'] ? '+' : '-');
		span.onclick = function(){CCSE.ToggleCollabsibleMenu(title + 'info'); Game.UpdateMenu();};
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
		div.classList.add('subsection');
		if(!CCSE.collapseMenu[title + 'info']) div.appendChild(bodyDiv);
		
		
		var menu = l('menu');
		if(menu){
			var about = menu.getElementsByClassName('subsection')[0];
			if(about){
				menu.childNodes[1].insertBefore(div, about);
			}
		}
	}
	
	
	/*=====================================================================================
	Minigames
	=======================================================================================*/
	CCSE.MinigameReplacer = function(func, objKey){
		var me = Game.Objects[objKey];
		if(me.minigameLoaded) func(me, 'minigameScript-' + me.id);
		Game.customMinigameOnLoad[objKey].push(func);
	}
	
	CCSE.ReplaceGrimoire = function(){
		// Temporary variable for storing function strings
		// Slightly more efficient than nesting functions
		// Doubt it really matters
		var temp = '';
		var pos = 0;
		var proto;
		var obj;
		var objKey = 'Wizard tower';
		var M = Game.Objects[objKey].minigame;
		
		
		// M.computeMagicM
		if(!Game.customMinigame[objKey].computeMagicM) Game.customMinigame[objKey].computeMagicM = [];
		CCSE.SliceCodeIntoFunction('M.computeMagicM', -1, `
			// M.computeMagicM injection point 0
			for(var i in Game.customMinigame[objKey].computeMagicM) Game.customMinigame[objKey].computeMagicM[i]();
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.getFailChance
		// functions should return a value to multiply failChance by (Return 1 for no effect)
		if(!Game.customMinigame[objKey].getFailChance) Game.customMinigame[objKey].getFailChance = [];
		CCSE.ReplaceCodeIntoFunction('M.getFailChance', 'return', `
			// M.getFailChance injection point 0
			for(var i in Game.customMinigame[objKey].getFailChance) failChance *= Game.customMinigame[objKey].getFailChance[i](spell);`, -1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.castSpell
		// I'm open to suggestions
		
		
		// M.getSpellCost
		// functions should return a value to multiply out by (Return 1 for no effect)
		if(!Game.customMinigame[objKey].getSpellCost) Game.customMinigame[objKey].getSpellCost = [];
		CCSE.ReplaceCodeIntoFunction('M.getSpellCost', 'return', `
			// M.getSpellCost injection point 0
			for(var i in Game.customMinigame[objKey].getSpellCost) out *= Game.customMinigame[objKey].getSpellCost[i](spell);`, -1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.getSpellCostBreakdown
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].getSpellCostBreakdown) Game.customMinigame[objKey].getSpellCostBreakdown = [];
		CCSE.ReplaceCodeIntoFunction('M.getSpellCostBreakdown', 'return', `
			// M.getSpellCostBreakdown injection point 0
			for(var i in Game.customMinigame[objKey].getSpellCostBreakdown) str = Game.customMinigame[objKey].getSpellCostBreakdown[i](spell, str);`, -1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.spellTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].spellTooltip) Game.customMinigame[objKey].spellTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.spellTooltip', 'return str', `
			// M.spellTooltip injection point 0
			for(var i in Game.customMinigame[objKey].spellTooltip) str = Game.customMinigame[objKey].spellTooltip[i](id, str);`, -1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.refillTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].refillTooltip) Game.customMinigame[objKey].refillTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.refillTooltip', 'return', 'var str = ', 0,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		CCSE.SliceCodeIntoFunction('M.refillTooltip', -1, `
			// M.refillTooltip injection point 0
			for(var i in Game.customMinigame[objKey].refillTooltip) str = Game.customMinigame[objKey].refillTooltip[i](id, str);
			return str;
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.spells['hand of fate'].win
		// functions should push a value to choices
		if(!Game.customMinigame[objKey].fateWin) Game.customMinigame[objKey].fateWin = [];
		CCSE.ReplaceCodeIntoFunction('M.spells["hand of fate"].win', 'newShimmer.force', 
					`// M.spells["hand of fate"].win injection point 0
					for(var i in Game.customMinigame[objKey].fateWin) Game.customMinigame[objKey].fateWin[i](choices);`, -1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.spells['hand of fate'].fail
		// functions should push a value to choices
		if(!Game.customMinigame[objKey].fateFail) Game.customMinigame[objKey].fateFail = [];
		CCSE.ReplaceCodeIntoFunction('M.spells["hand of fate"].fail', 'newShimmer.force', 
					`// M.spells["hand of fate"].fail injection point 0
					for(var i in Game.customMinigame[objKey].fateFail) Game.customMinigame[objKey].fateFail[i](choices);`, -1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.launch
		if(M.launch.toString().indexOf('// M.launch injection point 0') == -1){
			CCSE.SliceCodeIntoFunction('M.launch', -1, `
	// M.launch injection point 0
	for(var i in Game.customMinigameOnLoad[objKey]) Game.customMinigameOnLoad[objKey][i](M.parent);
`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		}
	}
	
	CCSE.ReplacePantheon = function(){
		// Temporary variable for storing function strings
		// Slightly more efficient than nesting functions
		// Doubt it really matters
		var temp = '';
		var pos = 0;
		var proto;
		var obj;
		var objKey = 'Temple';
		var M = Game.Objects[objKey].minigame;
		
		
		// M.godTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].godTooltip) Game.customMinigame[objKey].godTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.godTooltip', 'return str', `
			// M.godTooltip injection point 0
			for(var i in Game.customMinigame[objKey].godTooltip) str = Game.customMinigame[objKey].godTooltip[i](id, str);`, -1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.slotTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].slotTooltip) Game.customMinigame[objKey].slotTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.slotTooltip', 'return str', `
			// M.slotTooltip injection point 0
			for(var i in Game.customMinigame[objKey].slotTooltip) str = Game.customMinigame[objKey].slotTooltip[i](id, str);`, -1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.useSwap
		if(!Game.customMinigame[objKey].useSwap) Game.customMinigame[objKey].useSwap = [];
		CCSE.SliceCodeIntoFunction('M.useSwap', -1, `
			// M.useSwap injection point 0
			for(var i in Game.customMinigame[objKey].useSwap) Game.customMinigame[objKey].useSwap[i](n);
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.slotGod
		if(!Game.customMinigame[objKey].slotGod) Game.customMinigame[objKey].slotGod = [];
		CCSE.SliceCodeIntoFunction('M.slotGod', -1, `
			// M.slotGod injection point 0
			for(var i in Game.customMinigame[objKey].slotGod) Game.customMinigame[objKey].slotGod[i](god, slot);
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.dragGod
		if(!Game.customMinigame[objKey].dragGod) Game.customMinigame[objKey].dragGod = [];
		CCSE.SliceCodeIntoFunction('M.dragGod', -1, `
			// M.dragGod injection point 0
			for(var i in Game.customMinigame[objKey].dragGod) Game.customMinigame[objKey].dragGod[i](what);
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.dropGod
		if(!Game.customMinigame[objKey].dropGod) Game.customMinigame[objKey].dropGod = [];
		CCSE.SliceCodeIntoFunction('M.dropGod', -1, `
			// M.dropGod injection point 0
			for(var i in Game.customMinigame[objKey].dropGod) Game.customMinigame[objKey].dropGod[i]();
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.hoverSlot
		if(!Game.customMinigame[objKey].hoverSlot) Game.customMinigame[objKey].hoverSlot = [];
		CCSE.SliceCodeIntoFunction('M.hoverSlot', -1, `
			// M.hoverSlot injection point 0
			for(var i in Game.customMinigame[objKey].hoverSlot) Game.customMinigame[objKey].hoverSlot[i](what);
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// Game.hasGod
		// Game.forceUnslotGod
		
		
		// M.refillTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].refillTooltip) Game.customMinigame[objKey].refillTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.refillTooltip', 'return', 'var str = ', 0,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		CCSE.SliceCodeIntoFunction('M.refillTooltip', -1, `
			// M.refillTooltip injection point 0
			for(var i in Game.customMinigame[objKey].refillTooltip) str = Game.customMinigame[objKey].refillTooltip[i](id, str);
			return str;
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.launch
		if(M.launch.toString().indexOf('// M.launch injection point 0') == -1){
			CCSE.SliceCodeIntoFunction('M.launch', -1, `
	// M.launch injection point 0
	for(var i in Game.customMinigameOnLoad[objKey]) Game.customMinigameOnLoad[objKey][i](M.parent);
`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		}
	}
	
	CCSE.ReplaceGarden = function(){
		// Temporary variable for storing function strings
		// Slightly more efficient than nesting functions
		// Doubt it really matters
		var temp = '';
		var pos = 0;
		var proto;
		var obj;
		var objKey = 'Farm';
		var M = Game.Objects[objKey].minigame;
		
		
		// M.getUnlockedN
		if(!Game.customMinigame[objKey].getUnlockedN) Game.customMinigame[objKey].getUnlockedN = [];
		CCSE.ReplaceCodeIntoFunction('M.getUnlockedN', 'return', 
			`// M.getUnlockedN injection point 0
			for(var i in Game.customMinigame[objKey].getUnlockedN) Game.customMinigame[objKey].getUnlockedN[i]();`, -1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.dropUpgrade
		if(!Game.customMinigame[objKey].dropUpgrade) Game.customMinigame[objKey].dropUpgrade = [];
		CCSE.SliceCodeIntoFunction('M.dropUpgrade', -1, 
			`// M.dropUpgrade injection point 0
			for(var i in Game.customMinigame[objKey].dropUpgrade) Game.customMinigame[objKey].dropUpgrade[i](upgrade, rate);
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.computeMatures
		if(!Game.customMinigame[objKey].computeMatures) Game.customMinigame[objKey].computeMatures = [];
		CCSE.SliceCodeIntoFunction('M.computeMatures', -1, 
			`// M.computeMatures injection point 0
			for(var i in Game.customMinigame[objKey].computeMatures) Game.customMinigame[objKey].computeMatures[i](mult);
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.getMuts
		// functions should push mutations to muts
		if(!Game.customMinigame[objKey].getMuts) Game.customMinigame[objKey].getMuts = [];
		CCSE.ReplaceCodeIntoFunction('M.getMuts', 'return', 
			`// M.getMuts injection point 0
			for(var i in Game.customMinigame[objKey].getMuts) Game.customMinigame[objKey].getMuts[i](neighs, neighsM, muts);`, -1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.computeBoostPlot
		// You're going to have to use MAXIMUM EFFORT
		if(!Game.customMinigame[objKey].computeBoostPlot) Game.customMinigame[objKey].computeBoostPlot = [];
		CCSE.SliceCodeIntoFunction('M.computeBoostPlot', -1, 
			`// M.computeBoostPlot injection point 0
			for(var i in Game.customMinigame[objKey].computeBoostPlot) Game.customMinigame[objKey].computeBoostPlot[i]();
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.computeEffs
		// functions should change effs (or not, I'm a comment, not a cop)
		if(!Game.customMinigame[objKey].computeEffs) Game.customMinigame[objKey].computeEffs = [];
		CCSE.ReplaceCodeIntoFunction('M.computeEffs', 'M.effs=effs;', 
			`// M.computeEffs injection point 0
			for(var i in Game.customMinigame[objKey].computeEffs) Game.customMinigame[objKey].computeEffs[i](effs);`, -1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.tools TODO
		
		
		// M.getCost TODO
		
		
		// M.getPlantDesc
		// Return ret for no effect
		if(!Game.customMinigame[objKey].getPlantDesc) Game.customMinigame[objKey].getPlantDesc = [];
		CCSE.ReplaceCodeIntoFunction('M.getPlantDesc', 'return', 'var ret = ', 0,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		CCSE.SliceCodeIntoFunction('M.getPlantDesc', -1, 
				`// M.getPlantDesc injection point 0
				for(var i in Game.customMinigame[objKey].getPlantDesc) ret = Game.customMinigame[objKey].getPlantDesc[i](me, ret);
				return ret;
			`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.soilTooltip
		// Return str for no effect
		if(!Game.customMinigame[objKey].soilTooltip) Game.customMinigame[objKey].soilTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.soilTooltip', 'return str;', 
				`// M.soilTooltip injection point 0
				for(var i in Game.customMinigame[objKey].soilTooltip) str = Game.customMinigame[objKey].soilTooltip[i](id, str);`, -1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.seedTooltip
		// Return str for no effect
		if(!Game.customMinigame[objKey].seedTooltip) Game.customMinigame[objKey].seedTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.seedTooltip', 'return str;', 
				`// M.seedTooltip injection point 0
				for(var i in Game.customMinigame[objKey].seedTooltip) str = Game.customMinigame[objKey].seedTooltip[i](id, str);`, -1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.toolTooltip
		// Return str for no effect
		if(!Game.customMinigame[objKey].toolTooltip) Game.customMinigame[objKey].toolTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.toolTooltip', 'return str;', 
				`// M.toolTooltip injection point 0
				for(var i in Game.customMinigame[objKey].toolTooltip) str = Game.customMinigame[objKey].toolTooltip[i](id, str);`, -1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.tileTooltip
		// Return ret for no effect
		if(!Game.customMinigame[objKey].tileTooltip) Game.customMinigame[objKey].tileTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.tileTooltip', 'return function(){', `return function(){
				var ret = '';`, 0,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		CCSE.ReplaceCodeIntoFunction('M.tileTooltip', /return str;/g, 'ret = str;', 0,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		CCSE.ReplaceCodeIntoFunction('M.tileTooltip', '};', 
				`// M.tileTooltip injection point 0
				for(var i in Game.customMinigame[objKey].tileTooltip) ret = Game.customMinigame[objKey].tileTooltip[i](x, y, ret);
				return ret;`, -1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.refillTooltip
		// functions should return a string value (Return str for no effect)
		if(!Game.customMinigame[objKey].refillTooltip) Game.customMinigame[objKey].refillTooltip = [];
		CCSE.ReplaceCodeIntoFunction('M.refillTooltip', 'return', 'var str = ', 0,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		CCSE.SliceCodeIntoFunction('M.refillTooltip', -1, `
			// M.refillTooltip injection point 0
			for(var i in Game.customMinigame[objKey].refillTooltip) str = Game.customMinigame[objKey].refillTooltip[i](id, str);
			return str;
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.buildPanel
		if(!Game.customMinigame[objKey].buildPanel) Game.customMinigame[objKey].buildPanel = [];
		CCSE.SliceCodeIntoFunction('M.buildPanel', -1, 
			`// M.buildPanel injection point 0
			for(var i in Game.customMinigame[objKey].buildPanel) Game.customMinigame[objKey].buildPanel[i]();
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.buildPlot
		if(!Game.customMinigame[objKey].buildPlot) Game.customMinigame[objKey].buildPlot = [];
		CCSE.SliceCodeIntoFunction('M.buildPlot', -1, 
			`// M.buildPlot injection point 0
			for(var i in Game.customMinigame[objKey].buildPlot) Game.customMinigame[objKey].buildPlot[i]();
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.clickTile
		if(!Game.customMinigame[objKey].clickTile) Game.customMinigame[objKey].clickTile = [];
		CCSE.SliceCodeIntoFunction('M.clickTile', -1, 
			`// M.clickTile injection point 0
			for(var i in Game.customMinigame[objKey].clickTile) Game.customMinigame[objKey].clickTile[i](x, y);
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.useTool
		
		
		// M.getTile
		// Return ret to have no effect
		if(!Game.customMinigame[objKey].getTile) Game.customMinigame[objKey].getTile = [];
		CCSE.ReplaceCodeIntoFunction('M.getTile', '{', 'var ret;', 1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		CCSE.ReplaceCodeIntoFunction('M.getTile', 'return', 'ret =', 0,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		CCSE.ReplaceCodeIntoFunction('M.getTile', 'return', 'else ret =', 0,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		CCSE.SliceCodeIntoFunction('M.getTile', -1, 
			`// M.getTile injection point 0
			for(var i in Game.customMinigame[objKey].getTile) ret = Game.customMinigame[objKey].getTile[i](x, y, ret);
			return ret;
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.getTile
		// Return ret to have no effect
		if(!Game.customMinigame[objKey].isTileUnlocked) Game.customMinigame[objKey].isTileUnlocked = []; 
		CCSE.ReplaceCodeIntoFunction('M.isTileUnlocked', '{', 'var ret;', 1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		CCSE.ReplaceCodeIntoFunction('M.isTileUnlocked', /return/g, 'ret =', 0,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		CCSE.SliceCodeIntoFunction('M.isTileUnlocked', -1, 
			`// M.isTileUnlocked injection point 0
			for(var i in Game.customMinigame[objKey].isTileUnlocked) ret = Game.customMinigame[objKey].isTileUnlocked[i](x, y, ret);
			return ret;
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.computeStepT
		if(!Game.customMinigame[objKey].computeStepT) Game.customMinigame[objKey].computeStepT = [];
		CCSE.SliceCodeIntoFunction('M.computeStepT', -1, 
			`// M.computeStepT injection point 0
			for(var i in Game.customMinigame[objKey].computeStepT) Game.customMinigame[objKey].computeStepT[i]();
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.convert
		if(!Game.customMinigame[objKey].convert) Game.customMinigame[objKey].convert = [];
		CCSE.SliceCodeIntoFunction('M.convert', -1, 
			`// M.convert injection point 0
			for(var i in Game.customMinigame[objKey].convert) Game.customMinigame[objKey].convert[i]();
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.harvestAll
		if(!Game.customMinigame[objKey].harvestAll) Game.customMinigame[objKey].harvestAll = [];
		CCSE.SliceCodeIntoFunction('M.harvestAll', -1, 
			`// M.harvestAll injection point 0
			for(var i in Game.customMinigame[objKey].harvestAll) Game.customMinigame[objKey].harvestAll[i](type, mature, mortal);
		`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.harvest
		if(!Game.customMinigame[objKey].harvest) Game.customMinigame[objKey].harvest = [];
		CCSE.ReplaceCodeIntoFunction('M.harvest', 'return true;', 
				`// M.harvest injection point 0
				for(var i in Game.customMinigame[objKey].harvest) Game.customMinigame[objKey].harvest[i](x, y, manual);`, -1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.unlockSeed
		if(!Game.customMinigame[objKey].unlockSeed) Game.customMinigame[objKey].unlockSeed = [];
		CCSE.ReplaceCodeIntoFunction('M.unlockSeed', 'return true;', 
			`// M.unlockSeed injection point 0
			for(var i in Game.customMinigame[objKey].unlockSeed) Game.customMinigame[objKey].unlockSeed[i](me);`, -1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.lockSeed
		if(!Game.customMinigame[objKey].lockSeed) Game.customMinigame[objKey].lockSeed = [];
		CCSE.ReplaceCodeIntoFunction('M.lockSeed', 'return true;', 
			`// M.lockSeed injection point 0
			for(var i in Game.customMinigame[objKey].lockSeed) Game.customMinigame[objKey].lockSeed[i](me);`, -1,
			"var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		
		
		// M.launch
		if(M.launch.toString().indexOf('// M.launch injection point 0') == -1){
			CCSE.SliceCodeIntoFunction('M.launch', -1, `
	// M.launch injection point 0
	for(var i in Game.customMinigameOnLoad[objKey]) Game.customMinigameOnLoad[objKey][i](M.parent);
`, "var objKey = '" + objKey + "';var M = Game.Objects[objKey].minigame;");
		}
	}
	
	
	/*=====================================================================================
	Grimoire
	=======================================================================================*/
	if(!CCSE.customRedrawSpells) CCSE.customRedrawSpells = [];
	CCSE.RedrawSpells = function(){
		var str = '';
		var M = Game.Objects['Wizard tower'].minigame;
		
		for(var i in M.spells){
			var me = M.spells[i];
			var icon = me.icon || [28,12];
			str += '<div class="grimoireSpell titleFont" id="grimoireSpell' + me.id + '" ' + Game.getDynamicTooltip('Game.ObjectsById[' + M.parent.id + '].minigame.spellTooltip(' + me.id + ')','this') + '><div class="usesIcon shadowFilter grimoireIcon" style="background-position:' + (-icon[0] * 48) + 'px ' + (-icon[1] * 48) + 'px;"></div><div class="grimoirePrice" id="grimoirePrice' + me.id + '">-</div></div>';
		}
		
		l('grimoireSpells').innerHTML = str;
		
		for(var i in M.spells){
			var me = M.spells[i];
			AddEvent(l('grimoireSpell' + me.id), 'click', function(spell){return function(){PlaySound('snd/tick.mp3'); M.castSpell(spell);}}(me));
		}
		
		for(var i in CCSE.customRedrawSpells) CCSE.customRedrawSpells[i]();
	}
	// Cookie Monster compatability because it was here first
	CCSE.customRedrawSpells.push(function(){if(typeof CM != 'undefined') CM.Disp.AddTooltipGrimoire();});
	
	if(!CCSE.customNewSpell) CCSE.customNewSpell = [];
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
		
		for(var i in CCSE.customNewSpell) CCSE.customNewSpell[i](key, spell);
		CCSE.RedrawSpells();
	}
	
	
	/*=====================================================================================
	Pantheon
	=======================================================================================*/
	if(!CCSE.customRedrawGods) CCSE.customRedrawGods = [];
	CCSE.RedrawGods = function(){
		var str = '';
		var M = Game.Objects['Temple'].minigame;
		
		for(var i in M.slot){
			var me = M.slot[i];
			str += '<div class="ready templeGod templeGod' + (i % 4) + ' templeSlot titleFont" id="templeSlot' + i + '" ' + Game.getDynamicTooltip('Game.ObjectsById[' + M.parent.id + '].minigame.slotTooltip(' + i + ')', 'this') + '><div class="usesIcon shadowFilter templeGem templeGem' + (parseInt(i) + 1) + '"></div></div>';
		}
		l('templeSlots').innerHTML = str;
		
		str = '';
		for(var i in M.gods){
			var me = M.gods[i];
			var icon = me.icon || [0,0];
			str += '<div class="ready templeGod templeGod' + (me.id % 4) + ' titleFont" id="templeGod' + me.id + '" ' + Game.getDynamicTooltip('Game.ObjectsById[' + M.parent.id + '].minigame.godTooltip(' + me.id + ')', 'this') + '><div class="usesIcon shadowFilter templeIcon" style="background-position:' + (-icon[0] * 48) + 'px ' + (-icon[1] * 48) + 'px;"></div><div class="templeSlotDrag" id="templeGodDrag' + me.id + '"></div></div>';
			str += '<div class="templeGodPlaceholder" id="templeGodPlaceholder' + me.id + '"></div>';
		}
		l('templeGods').innerHTML = str;
		
		for(var i in M.slot){
			var me=M.slot[i];
			AddEvent(l('templeSlot' + i), 'mouseover', function(what){return function(){M.hoverSlot(what);}}(i));
			AddEvent(l('templeSlot' + i), 'mouseout', function(what){return function(){M.hoverSlot(-1);}}(i));
		}
		
		for(var i in M.gods){
			var me = M.gods[i];
			AddEvent(l('templeGodDrag' + me.id), 'mousedown', function(what){return function(){M.dragGod(what);}}(me));
			AddEvent(l('templeGodDrag' + me.id), 'mouseup', function(what){return function(){M.dropGod(what);}}(me));
		}
		
		M.load(M.save());
		for(var i in CCSE.customRedrawGods) CCSE.customRedrawGods[i]();
	}
	
	if(!CCSE.customNewGod) CCSE.customNewGod = [];
	CCSE.NewGod = function(key, god){
		var M = Game.Objects['Temple'].minigame;
		
		M.gods[key] = god;
		
		M.godsById = [];
		var n = 0;
		for(var i in M.gods){
			M.gods[i].id = n;
			M.godsById[n] = M.gods[i];
			n++;
		}
		
		for(var i in CCSE.customNewGod) CCSE.customNewGod[i](key, god);
		CCSE.RedrawGods();
	}
	
	
	/*=====================================================================================
	Garden
	=======================================================================================*/
	if(!CCSE.customNewPlant) CCSE.customNewPlant = [];
	CCSE.NewPlant = function(key, plant){
		var M = Game.Objects['Farm'].minigame;
		
		M.plants[key] = plant;
		
		M.plantsById = [];
		var n = 0;
		for(var i in M.plants){
			M.plants[i].id = n;
			M.plantsById[n] = M.plants[i];
			n++;
		}
		
		for(var i in CCSE.customNewPlant) CCSE.customNewPlant[i](key, plant);
		M.buildPanel();
	}
	
	
	/*=====================================================================================
	Save custom things
	If you use CCSE to create custom upgrades or achievements, 
	it will also save their state to local storage whenever the game is saved.
		Each custom upgrade or achievement needs a unique name, or they could get overwritten.
		Yes, this means across mods as well. 
		If two mods have things with the same name, the mods cannot be used at the same time.
		This is because of how the game itself keeps track of these things
	
	You can also use CCSE to save your mod data. 
		Add your save data as a child of CCSE.save.OtherMods. Make sure not to step on anyone else's toes!
		Push your save function into CCSE.customSave, and push your load function into CCSE.customLoad
	=======================================================================================*/
	if(!CCSE.customSave) CCSE.customSave = [];
	CCSE.WriteSave = function(type){
		CCSE.save.version = CCSE.version;
		
		for(var name in CCSE.save.Buildings){
			if(Game.Objects[name]){
				var saved = CCSE.save.Buildings[name];
				var me = Game.Objects[name];
				
				saved.amount = me.amount;
				saved.bought = me.bought;
				saved.totalCookies = me.totalCookies;
				saved.level = me.level;
				saved.muted = me.muted;
				saved.free = me.free;
				
				if(Game.isMinigameReady(me)) saved.minigameSave = me.minigame.save(); else saved.minigameSave = '';
			}
		}
		
		for(var name in CCSE.save.Achievements){
			if(Game.Achievements[name]){
				CCSE.save.Achievements[name].won = Game.Achievements[name].won;
			}
		}
		
		for(var name in CCSE.save.Upgrades){
			if(Game.Upgrades[name]){
				CCSE.save.Upgrades[name].unlocked = Game.Upgrades[name].unlocked;
				CCSE.save.Upgrades[name].bought = Game.Upgrades[name].bought;
			}
		}
		
		for(var name in CCSE.save.Buffs){
			var buff = CCSE.save.Buffs[name];
			buff.time = 0;
			if(Game.buffs[buff.name]){
				if(Game.buffs[buff.name].time){
					buff.time = Game.buffs[buff.name].time;
					buff.maxTime = Game.buffs[buff.name].maxTime;
					buff.arg1 = Game.buffs[buff.name].arg1;
					buff.arg2 = Game.buffs[buff.name].arg2;
					buff.arg3 = Game.buffs[buff.name].arg3;
				}
			}
		}
		
		for(var name in CCSE.save.Seasons){
			var season = CCSE.save.Seasons[name];
			season.lastTime = Date.now();
			if(Game.season == name){
				season.T = Game.seasonT;
			}
			else{
				season.T = -1;
			}
		}
		
		for(var i in CCSE.customSave) CCSE.customSave[i]();
		
		var str = JSON.stringify(CCSE.save);
		
		if(type == 2){
			return str;
		}
		else if(type == 3){
			return JSON.stringify(CCSE.save, null, 2);
		}
		else if (type==1){
			str = escape(utf8_to_b64(str) + '!END!');
			return str;
		}
		else{
			str = utf8_to_b64(str) + '!END!';
			str = escape(str);
			Game.localStorageSet(CCSE.name, str);
		}
	}
	
	if(!CCSE.customLoad) CCSE.customLoad = [];
	CCSE.LoadSave = function(data, isJSON){
		CCSE.save = null;
		var str = '';
		
		if(isJSON){
			CCSE.save = JSON.parse(data);
		} 
		else{
			if(data){
				str = unescape(data);
			}else{
				if(Game.localStorageGet(CCSE.name)) str = unescape(Game.localStorageGet(CCSE.name));
			}
			
			if(str != ''){
				str = str.split('!END!')[0];
				str = b64_to_utf8(str);
				CCSE.save = JSON.parse(str);
			}
		}
		
		
		if(!CCSE.save) CCSE.save = {};
		if(!CCSE.save.version) CCSE.save.version = 1;
		if(!CCSE.save.Achievements) CCSE.save.Achievements = {};
		if(!CCSE.save.Upgrades) CCSE.save.Upgrades = {};
		if(!CCSE.save.Buildings) CCSE.save.Buildings = {};
		if(!CCSE.save.Buffs) CCSE.save.Buffs = {};
		if(!CCSE.save.Seasons) CCSE.save.Seasons = {};
		if(!CCSE.save.OtherMods) CCSE.save.OtherMods = {};
		
		if(CCSE.save.version != CCSE.version){
			l('logButton').classList.add('hasUpdate');
			CCSE.collapseMenu['CCSEinfo'] = 0;
		}else{
			CCSE.collapseMenu['CCSEinfo'] = 1;
		}
		
		for(var name in CCSE.save.Buildings){
			if(Game.Objects[name]){
				var saved = CCSE.save.Buildings[name];
				var me = Game.Objects[name];
				
				me.switchMinigame(false);
				me.pics = [];
				
				me.amount = saved.amount;
				me.bought = saved.bought;
				me.totalCookies = saved.totalCookies;
				me.level = saved.level;
				me.muted = saved.muted;
				me.free = saved.free ? saved.free : 0; // Left this out earlier, can't expect it to be there
				
				me.minigameSave = saved.minigameSave;
				if(me.minigame && me.minigameLoaded && me.minigame.reset){me.minigame.reset(true); me.minigame.load(me.minigameSave);}
				
				Game.BuildingsOwned += me.amount;
			}
		}
		
		for(var name in CCSE.save.Achievements){
			if(Game.Achievements[name]){
				Game.Achievements[name].won = CCSE.save.Achievements[name].won;
			}
		}
		
		for(var name in CCSE.save.Upgrades){
			if(Game.Upgrades[name]){
				Game.Upgrades[name].unlocked = CCSE.save.Upgrades[name].unlocked;
				Game.Upgrades[name].bought = CCSE.save.Upgrades[name].bought;
			}
		}
		
		for(var name in CCSE.save.Buffs){
			var found = false;
			for(var i in Game.buffTypes) if(Game.buffTypes[i].name == name) found = true;
			if(found){
				if(CCSE.save.Buffs[name].time){
					var buff = CCSE.save.Buffs[name];
					Game.gainBuff(name, buff.maxTime / Game.fps, buff.arg1, buff.arg2, buff.arg3).time = buff.time;
				}
			}
		}
		
		for(var name in CCSE.save.Seasons){
			if(Game.seasons[name]){
				if(CCSE.save.Seasons[name].T > 0){
					Game.season = name;
					Game.seasonT = CCSE.save.Seasons[name].T;
					var framesElapsed = Math.ceil(((Date.now() - CCSE.save.Seasons[name].lastTime) / 1000) * Game.fps);
					if(Game.seasonT > 0) Game.seasonT = Math.max(Game.seasonT - framesElapsed, 1);
				}
				
				if(Game.Has('Season switcher')) Game.Unlock(Game.seasons[name].trigger);
			}
		}
		
		Game.upgradesToRebuild = 1;
		for(var i in CCSE.customLoad) CCSE.customLoad[i]();
	}
	
	CCSE.ExportSave = function(){
		Game.Prompt('<h3>Export configuration</h3><div class="block">This is your CCSE save.<br>It contains data that other mods authors decided to allow CCSE to manage, as well as data for custom things added through CCSE (i.e. achivements, upgrades, etc)</div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;" readonly>' + 
					CCSE.WriteSave(1) + 
					'</textarea></div>',['All done!']);
		l('textareaPrompt').focus();
		l('textareaPrompt').select();
	}
	
	CCSE.ImportSave = function(){
		Game.Prompt('<h3>Import config</h3><div class="block">Paste your CCSE save here.</div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;"></textarea></div>',
					[['Load','if(l(\'textareaPrompt\').value.length > 0){CCSE.LoadSave(l(\'textareaPrompt\').value); Game.ClosePrompt(); Game.UpdateMenu();}'], 'Nevermind']);
		l('textareaPrompt').focus();
	}
	
	CCSE.ExportEditableSave = function(){
		Game.Prompt('<h3>Export configuration</h3><div class="block">This is your CCSE save.<br>In JSON format for people who want to edit it.</div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;" readonly>' + 
					CCSE.WriteSave(3) + 
					'</textarea></div>',['All done!']);
		l('textareaPrompt').focus();
		l('textareaPrompt').select();
	}
	
	CCSE.ImportEditableSave = function(){
		Game.Prompt('<h3>Import config</h3><div class="block">Paste your CCSE save here (in JSON format).</div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;"></textarea></div>',
					[['Load','if(l(\'textareaPrompt\').value.length > 0){CCSE.LoadSave(l(\'textareaPrompt\').value, 1); Game.ClosePrompt(); Game.UpdateMenu();}'], 'Nevermind']);
		l('textareaPrompt').focus();
	}
	
	/*CCSE.Reset = function(hard){
		if(hard){
			for(var name in CCSE.save.Achievements){
				CCSE.save.Achievements[name].won = 0;
				if(Game.Achievements[name]) Game.Achievements[name].won = 0;
			}
		}
		
		for(var name in CCSE.save.Upgrades){
			if(Game.Upgrades[name]){
				var me=Game.Upgrades[name];
				if (hard || me.pool != 'prestige') me.bought=0;
				if (hard || (me.pool != 'prestige' && !me.lasting))
				{
					if (!hard && Game.Has('Keepsakes') && Game.seasonDrops.indexOf(me.name) != -1 && Math.random() < 1 / 5){}
					else me.unlocked = 0;
				}
				
				CCSE.save.Upgrades[name].unlocked = Game.Upgrades[name].unlocked;
				CCSE.save.Upgrades[name].bought = Game.Upgrades[name].bought;
			}
		}
	}*/
	
	
	/*=====================================================================================
	Standard creation helpers
	=======================================================================================*/
	CCSE.NewUpgrade = function(name, desc, price, icon, buyFunction){
		var me = new Game.Upgrade(name, desc, price, icon, buyFunction);
		CCSE.ReplaceUpgrade(name);
		
		if(CCSE.save.Upgrades[name]){
			me.unlocked = CCSE.save.Upgrades[name].unlocked;
			me.bought = CCSE.save.Upgrades[name].bought;
		}else{
			CCSE.save.Upgrades[name] = {
				unlocked: 0,
				bought: 0
			}
		}
		
		return me;
	}
	
	CCSE.NewHeavenlyUpgrade = function(name, desc, price, icon, posX, posY, parents, buyFunction){
		var me = CCSE.NewUpgrade(name, desc, price, icon, buyFunction);
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
	
	CCSE.NewAchievement = function(name, desc, icon){
		var me = new Game.Achievement(name, desc, icon);
		CCSE.ReplaceAchievement(name);
		
		if(CCSE.save.Achievements[name]){
			me.won = CCSE.save.Achievements[name].won;
		}else{
			CCSE.save.Achievements[name] = {
				won: 0
			}
		}
		
		return me;
	}
	
	CCSE.NewBuilding = function(name, commonName, desc, icon, iconColumn, art, price, cps, buyFunction, foolObject, buildingSpecial){
		var me = new Game.Object(name, commonName, desc, icon, iconColumn, art, price, cps, buyFunction);
		
		// This is the name, description, and icon used during Business Season
		if(foolObject) Game.foolObjects[name] = foolObject;
		// The name of this building's golden cookie buff and debuff
		if(buildingSpecial) Game.goldenCookieBuildingBuffs[name] = buildingSpecial;
		
		CCSE.ReplaceBuilding(name);
		
		if(art.customBuildingPic){
			Game.customBuildStore.push(function(){
				l('productIcon' + me.id).style.backgroundImage = 'url(' + art.customBuildingPic + ')';
				l('productIconOff' + me.id).style.backgroundImage = 'url(' + art.customBuildingPic + ')';
			});
		}
		if(art.customIconsPic){
			Game.customBuildings[name].tooltip.push(function(obj, ret){
				if(me.locked) return ret;
				else return ret.replace('background-position', 'background-image:url(' + obj.art.customIconsPic + ');background-position');
			});
		}
		
		
		
		if(CCSE.save.Buildings[name]){
			var saved = CCSE.save.Buildings[name];
			me.amount = saved.amount;
			me.bought = saved.bought;
			me.totalCookies = saved.totalCookies;
			me.level = saved.level;
			me.muted = saved.muted;
			me.free = saved.free ? saved.free : 0; // Left this out earlier, can't expect it to be there
			me.minigameSave = saved.minigameSave;
			
			Game.BuildingsOwned += me.amount;
			
		}else{
			var saved = {};
			saved.amount = 0;
			saved.bought = 0;
			saved.totalCookies = 0;
			saved.level = 0;
			saved.muted = 0;
			saved.minigameSave = '';
			
			CCSE.save.Buildings[name] = saved;
		}
		
		
		Game.BuildStore();
		
		
		me.canvas=l('rowCanvas'+me.id);
		me.ctx=me.canvas.getContext('2d',{alpha:false});
		me.pics=[];
		var icon=[0*64,me.icon*64];
		var muteStr = '<div class="tinyProductIcon" id="mutedProduct'+me.id+'" style="display:none;' + (me.art.customBuildingPic ? 'background-image:url(' + me.art.customBuildingPic + ');' : '') + 'background-position:-'+icon[0]+'px -'+icon[1]+'px;" '+Game.clickStr+'="Game.ObjectsById['+me.id+'].mute(0);PlaySound(Game.ObjectsById['+me.id+'].muted?\'snd/clickOff.mp3\':\'snd/clickOn.mp3\');" '+Game.getDynamicTooltip('Game.mutedBuildingTooltip('+me.id+')','this')+'></div>';
		
		AddEvent(me.canvas,'mouseover',function(me){return function(){me.mouseOn=true;}}(me));
		AddEvent(me.canvas,'mouseout',function(me){return function(){me.mouseOn=false;}}(me));
		AddEvent(me.canvas,'mousemove',function(me){return function(e){var box=this.getBoundingClientRect();me.mousePos[0]=e.pageX-box.left;me.mousePos[1]=e.pageY-box.top;}}(me));
		
		l('buildingsMute').innerHTML+=muteStr;
		
		
		
		Game.recalculateGains = 1;
		return me;
	}
	
	CCSE.NewBuff = function(name, func){
		var me = new Game.buffType(name, func);
		
		if(CCSE.save.Buffs[name]){
			if(CCSE.save.Buffs[name].time){
				CCSE.save.Buffs[name].name = func().name;
				var buff = CCSE.save.Buffs[name];
				Game.gainBuff(name, buff.maxTime / Game.fps, buff.arg1, buff.arg2, buff.arg3).time = buff.time;
			}
		}else{
			CCSE.save.Buffs[name] = {
				name: func().name,
				maxTime: 0,
				time: 0,
				arg1: 0,
				arg2: 0,
				arg3: 0
			}
		}
		
		return me;
	}
	
	CCSE.NewSeason = function(name, firstDay, lastDay, season, announcement){
		Game.seasons[name] = season;
		
		lastDay.setDate(lastDay.getDate() + 1); // lastDay is inclusive
		if(Date.now() >= firstDay && Date.now() <= lastDay) Game.baseSeason = name;
		
		Game.customLoad.push(function(){
			if(Game.season == name && Game.season == Game.baseSeason){
				Game.Notify(announcement[0], announcement[1], announcement[2], 60 * 3);
			}
		});
		
		CCSE.ReplaceCodeIntoFunction('Game.WriteSave', /\(\(Game.season/g, "((Game.season && Game.season != '" + name + "'", 0);
		
		Game.computeSeasons();
		Game.computeSeasonPrices();
		
		if(CCSE.save.Seasons[name]){
			if(CCSE.save.Seasons[name].T > 0){
				Game.seasonT = CCSE.save.Seasons[name].T;
				Game.season = name;
				var framesElapsed = Math.ceil(((Date.now() - CCSE.save.Seasons[name].lastTime) / 1000) * Game.fps);
				if(Game.seasonT > 0) Game.seasonT = Math.max(Game.seasonT - framesElapsed, 1);
			}
		}else{
			CCSE.save.Seasons[name] = {
				T: 0,
				lastTime: Date.now()
			}
		}
		
		if(Game.Has('Season switcher')) Game.Unlock(Game.seasons[name].trigger);
		Game.upgradesToRebuild = 1;
	}
	
	
	/*=====================================================================================
	Other
	=======================================================================================*/
	CCSE.AddMoreWrinklers = function(n){
		var j = Game.wrinklers.length;
		for (var i = j; i < j + n; i++){
			Game.wrinklers.push({id:parseInt(i),close:0,sucked:0,phase:0,x:0,y:0,r:0,hurt:0,hp:Game.wrinklerHP,selected:0,type:0});
		}
	}
	
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
	Confirmation Prompts
	=======================================================================================*/
	CCSE.ConfirmGameVersion = function(modName, modVersion, version){
		var proceed = true;
		if(Game.version != version){
			proceed = confirm(modName + ' version ' + modVersion + ' is meant for Game version ' + version + '.  Loading a different version may cause errors.  Do you still want to load ' + modName + '?');
		}
		return proceed;
	}
	
	CCSE.ConfirmCCSEVersion = function(modName, modVersion, version){
		var proceed = true;
		if(CCSE.version != version){
			proceed = confirm(modName + ' version ' + modVersion + ' is meant for CCSE version ' + version + '.  Loading a different version may cause errors.  Do you still want to load ' + modName + '?');
		}
		return proceed;
	}
	
	CCSE.ConfirmGameCCSEVersion = function(modName, modVersion, gameVersion, ccseVersion){
		var proceed = true;
		if(Game.version != gameVersion && CCSE.version != ccseVersion){
			proceed = confirm(modName + ' version ' + modVersion + ' is meant for Game version ' + gameVersion + ' and CCSE version ' + ccseVersion + '.  Loading a different version may cause errors.  Do you still want to load ' + modName + '?');
		}
		else if(Game.version != gameVersion){
			proceed = confirm(modName + ' version ' + modVersion + ' is meant for Game version ' + gameVersion + '.  Loading a different version may cause errors.  Do you still want to load ' + modName + '?');
		}
		else if(CCSE.version != ccseVersion){
			proceed = confirm(modName + ' version ' + modVersion + ' is meant for CCSE version ' + ccseVersion + '.  Loading a different version may cause errors.  Do you still want to load ' + modName + '?');
		}
		return proceed;
	}
	
	
	/*=====================================================================================
	Start your engines
	=======================================================================================*/
	if(CCSE.ConfirmGameVersion(CCSE.name, CCSE.version, CCSE.GameVersion)) CCSE.init();
}

if(!CCSE.isLoaded && !CCSE.loading) CCSE.launch();