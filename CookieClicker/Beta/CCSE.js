Game.Win('Third-party');
if(CCSE === undefined) var CCSE = {};

CCSE.launch = function(){
	CCSE.isLoaded = 1;
	CCSE.Backup = {};
	
	CCSE.init = function(){
		if(typeof Game.customMenu == 'undefined') Game.customMenu = [];
		
		CCSE.ReplaceNativeMenu();
		
		if (Game.prefs.popups) Game.Popup('CCSE loaded!');
		else Game.Notify('CCSE loaded!', '', '', 1, 1);
	}
	
	
	CCSE.ReplaceNativeMenu = function(){
		CCSE.Backup.UpdateMenu = Game.UpdateMenu;
		Game.UpdateMenu = function(){
			CCSE.Backup.UpdateMenu();
			for(var i in Game.customMenu) Game.customMenu[i]();
		}
	}
	
	CCSE.AppendMenuString = function(str){
		var div = document.createElement('div');
		div.innerHTML = str;
		var menu = document.getElementById('menu');
		if(menu) {
			menu = menu.getElementsByClassName('subsection')[0];
			if(menu) {
				var padding = menu.getElementsByTagName('div');
				padding = padding[padding.length - 1];
				if(padding) {
					menu.insertBefore(div, padding);
				} else {
					menu.appendChild(div);
				}
			}
		}
	}
	
	
	CCSE.init();
}

if(!CCSE.isLoaded) CCSE.launch();