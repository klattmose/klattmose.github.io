Game.Win('Third-party');
if(CCSE === undefined) var CCSE = {};
CCSE.name = 'CCSE';
CCSE.version = '0.3';
CCSE.GameVersion = '2.019';

CCSE.launch = function(){
	CCSE.Backup = {};
	
	CCSE.init = function(){
		// Declare a whole mess of new mod hooks
		if(typeof Game.customMenu == 'undefined') Game.customMenu = [];
		if(typeof Game.customOptionsMenu == 'undefined') Game.customOptionsMenu = [];
		if(typeof Game.customStatsMenu == 'undefined') Game.customStatsMenu = [];
		if(typeof Game.customInfoMenu == 'undefined') Game.customInfoMenu = [];
		if(typeof Game.customScriptLoaded == 'undefined') Game.customScriptLoaded = [];
		CCSE.collapseMenu = {};
		
		
		// Inject the hooks into the main game
		CCSE.ReplaceNativeMenu();
		CCSE.ReplaceLoadSave();
		CCSE.ReplaceScriptLoaded();
		
		
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
	Menu functions
	=======================================================================================*/
	CCSE.ReplaceNativeMenu = function(){
		CCSE.Backup.UpdateMenu = Game.UpdateMenu;
		Game.UpdateMenu = function(){
			CCSE.Backup.UpdateMenu();
			
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
		}
	}
	
	CCSE.AppendOptionsMenuString = function(str){
		var div = document.createElement('div');
		div.innerHTML = str;
		CCSE.AppendOptionsMenuDiv(div);
	}
	
	CCSE.AppendCollapsibleOptionsMenuString = function(title, str){
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
		
		var div = document.createElement('div');
		if(!CCSE.collapseMenu[title]){
			div.innerHTML = str;
			div.insertBefore(titleDiv, div.childNodes[0]);
		}
		else{
			div.appendChild(titleDiv);
		}		
		
		CCSE.AppendOptionsMenuDiv(div);
	}
	
	CCSE.ToggleCollabsibleMenu = function(title) {
		if(CCSE.collapseMenu[title] == 0){
			CCSE.collapseMenu[title]++;
		}
		else{
			CCSE.collapseMenu[title]--;
		}
	}
	
	CCSE.AppendOptionsMenuDiv = function(div){
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
	
	CCSE.AppendStatsGeneralString = function(str){
		var div = document.createElement('div');
		div.innerHTML = str;
		CCSE.AppendStatsGeneralDiv(div);
	}
	
	CCSE.AppendStatsGeneralDiv = function(div){
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
	
	CCSE.AppendStatsSpecialString = function(str){
		var div = document.createElement('div');
		div.innerHTML = str;
		CCSE.AppendStatsSpecialDiv(div);
	}
	
	CCSE.AppendStatsSpecialDiv = function(div){
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
	Load Save
	=======================================================================================*/
	CCSE.ReplaceLoadSave = function(){
		if(!(Game.LoadSave.toString().indexOf('Game.customLoad') > 0)){
			CCSE.Backup.backupLoadSave = Game.LoadSave;
			Game.LoadSave = function(data){
				CCSE.Backup.backupLoadSave(data);
				for(var i in Game.customLoad) Game.customLoad[i](); // This isn't in the original Game.LoadSave
			}
		}
	}
	
	
	/*=====================================================================================
	Minigames
	=======================================================================================*/
	CCSE.ReplaceScriptLoaded = function(){
		CCSE.Backup.scriptLoaded = Game.scriptLoaded;
		Game.scriptLoaded = function(who, script) {
			CCSE.Backup.scriptLoaded(who, script);
			for(var i in Game.customScriptLoaded) Game.customScriptLoaded[i](who, script); // Who knows, maybe those arguments might be needed
		}
	}
	
	CCSE.init();
}

if(!CCSE.isLoaded) CCSE.launch();