Game.Win('Third-party');
if(CCSE === undefined) var CCSE = {};

CCSE.launch = function(){
	CCSE.isLoaded = 1;
	CCSE.Backup = {};
	
	CCSE.init = function(){
		if(typeof Game.customMenu == 'undefined') Game.customMenu = [];
		if(typeof Game.customScriptLoaded == 'undefined') Game.customScriptLoaded = [];
		
		
		CCSE.ReplaceNativeMenu();
		CCSE.ReplaceLoadSave();
		CCSE.ReplaceScriptLoaded();
		
		
		if (Game.prefs.popups) Game.Popup('CCSE loaded!');
		else Game.Notify('CCSE loaded!', '', '', 1, 1);
	}
	
	
	/*=====================================================================================
	Menu functions
	=======================================================================================*/
	CCSE.ReplaceNativeMenu = function(){
		CCSE.Backup.UpdateMenu = Game.UpdateMenu;
		Game.UpdateMenu = function(){
			CCSE.Backup.UpdateMenu();
			for(var i in Game.customMenu) Game.customMenu[i]();
		}
	}
	
	CCSE.AppendOptionsMenuString = function(str){
		var div = document.createElement('div');
		div.innerHTML = str;
		CCSE.AppendOptionsMenuDiv(div);
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
		
		if(general) general.insertBefore(div, general.childNodes[Math.max(general.childNodes.length - 2, 1)]);
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