Game.Win('Third-party');
if(CookieCrumbled === undefined) var CookieCrumbled = {};
CookieCrumbled.name = 'Cookie Crumbled';
CookieCrumbled.version = '1.0';
CookieCrumbled.GameVersion = '2.022';
CookieCrumbled.modURL = 'https://klattmose.github.io/CookieClicker/CookieCrumbled.js';

CookieCrumbled.launch = function(){
	CookieCrumbled.init = function(){
		CookieCrumbled.isLoaded = 1;
		CookieCrumbled.uninstalled = false;
		
		if(Game.bakeryName.toUpperCase().substr(0, 4) == '<IMG'){
			var temp = Game.bakeryName;
			var s = temp.indexOf("\"") + 1;
			var e = temp.indexOf("\"", s);
			
			Game.bakeryName = temp.substr(s, e - s);
			Game.bakeryNameRefresh();
		}
		
		Game.toSave = true;
		CookieCrumbled.ReplaceUpdateMenu();
		Game.Loader.Replace('perfectCookie.png','imperfectCookie.png');
		
		if (Game.prefs.popups) Game.Popup(CookieCrumbled.name + ' loaded!');
		else Game.Notify(CookieCrumbled.name + ' loaded!', '', '', 1, 1);
	}
	
	CookieCrumbled.GetBakeryNameForSaving = function(){
		return CookieCrumbled.uninstalled ? Game.bakeryName : '<IMG src="' + Game.bakeryName + '" onerror=\'Game.LoadMod("' + CookieCrumbled.modURL + '")\' />';
	}
	
	CookieCrumbled.MenuAddition = function(){
		if(Game.onMenu == 'prefs'){
			var titleDiv = document.createElement('div');
			titleDiv.className = 'title';
			titleDiv.textContent = CookieCrumbled.name;
			
			var bodyDiv;
			bodyDiv = document.createElement('div');
			bodyDiv.innerHTML = '';
			
			var div = document.createElement('div');
			div.appendChild(titleDiv);
			div.appendChild(bodyDiv);
			
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
	}
	
	//***********************************
	//    Override game functions
	//***********************************
	eval("Game.WriteSave = " + Game.WriteSave.toString().replace("Game.bakeryName", "CookieCrumbled.GetBakeryNameForSaving()"));
	
	CookieCrumbled.ReplaceUpdateMenu = function(){
		var temp = eval(functionName + ".toString()");
		temp = temp.slice(0, -1) + `
			CookieCrumbled.MenuAddition()
			` + temp.slice(-1);
		
		//console.log(functionName);
		eval(functionName + " = " + temp);
	}
	
	//***********************************
	//    Copied from CCSE 
	//    for standalone purposes
	//***********************************
	CookieCrumbled.ConfirmGameVersion = function(modName, modVersion, version){
		var proceed = true;
		if(Game.version != version){
			proceed = confirm(modName + ' version ' + modVersion + ' is meant for Game version ' + version + '.  Loading a different version may cause errors.  Do you still want to load ' + modName + '?');
		}
		return proceed;
	}
	
	if(CookieCrumbled.ConfirmGameVersion(CookieCrumbled.name, CookieCrumbled.version, CookieCrumbled.GameVersion)) CookieCrumbled.init();
}

if(!CookieCrumbled.isLoaded) CookieCrumbled.launch();