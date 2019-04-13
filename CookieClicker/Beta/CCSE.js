Game.Win('Third-party');
if(CCSE === undefined) var CCSE = {};
CCSE.name = 'CCSE';
CCSE.version = '0.11';
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
	Also declare hook arrays in the close vicinity of the fucntions they get used in
	=======================================================================================*/
	CCSE.ReplaceMainGame = function(){
		// Temporary variable for storing function strings
		// Slightly more efficient than nesting functions
		// Doubt it really matters
		var temp = '';
		
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
		if(!(Game.LoadSave.toString().indexOf('Game.customLoad') > 0)){
			CCSE.Backup.backupLoadSave = Game.LoadSave;
			Game.LoadSave = function(data){
				var ret = CCSE.Backup.backupLoadSave(data);
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
		if(!Game.customRandomFloor) Game.customRandomFloor = [];
		CCSE.Backup.randomFloor = randomFloor;
		randomFloor = function(x){
			var ret = CCSE.Backup.randomFloor(x);
			for(var i in Game.customRandomFloor) ret = Game.customRandomFloor[i](x, ret);
			return ret;
		}
		
		
		// Beautify
		if(!Game.customBeautify) Game.customBeautify = [];
		CCSE.Backup.Beautify = Beautify;
		Beautify = function(value, floats){
			var ret = CCSE.Backup.Beautify(value, floats);
			for(var i in Game.customBeautify) ret = Game.customBeautify[i](value, floats, ret);
			return ret;
		}
		
		
		// Tooltips
		if(!Game.customTooltipDraw) Game.customTooltipDraw = [];
		temp = Game.tooltip.draw.toString();
		eval('Game.tooltip.draw = ' + temp.slice(0, -1) + 
			'\nfor(var i in Game.customTooltipDraw) Game.customTooltipDraw[i](from, text, origin);\n' 
			+ temp.slice(-1));
		
		if(!Game.customTooltipUpdate) Game.customTooltipUpdate = [];
		temp = Game.tooltip.update.toString();
		eval('Game.tooltip.update = ' + temp.slice(0, -1) + 
			'\nfor(var i in Game.customTooltipUpdate) Game.customTooltipUpdate[i]();\n' + 
			temp.slice(-1));
		
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