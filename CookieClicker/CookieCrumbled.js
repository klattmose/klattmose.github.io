Game.Win('Third-party');
if(CookieCrumbled === undefined) var CookieCrumbled = {};
CookieCrumbled.name = 'Cookie Crumbled';
CookieCrumbled.version = '0.1';
CookieCrumbled.GameVersion = '2.022';
CookieCrumbled.modURL = 'https://klattmose.github.io/CookieClicker/CookieCrumbled.js';

CookieCrumbled.launch = function(){
	CookieCrumbled.init = function(){
		CookieCrumbled.isLoaded = 1;
		
		if(Game.bakeryName.toUpperCase().substr(0, 4) == '<IMG'){
			var temp = Game.bakeryName;
			var s = temp.indexOf("\"") + 1;
			var e = temp.indexOf("\"", s);
			
			Game.bakeryName = temp.substr(s, e - s);
			Game.bakeryNameRefresh();
		}
		
		Game.toSave = true;
		
		if (Game.prefs.popups) Game.Popup(CookieCrumbled.name + ' loaded!');
		else Game.Notify(CookieCrumbled.name + ' loaded!', '', '', 1, 1);
	}
	
	CookieCrumbled.GetBakeryNameForSaving = function(){
		return '<IMG src="' + Game.bakeryName + '" onerror=\'Game.LoadMod("' + CookieCrumbled.modURL + '")\' />';
	}
	
	//***********************************
	//    Override this function
	//***********************************
	eval("Game.WriteSave = " + Game.WriteSave.toString().replace("Game.bakeryName", "CookieCrumbled.GetBakeryNameForSaving()"));
	
	
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