# Cookie Clicker Script Extender (CCSE)

*Current version : 2.029*

**CCSE** is a modding framework for the game <code>https://orteil.dashnet.org/cookieclicker/</code>. On its own, it makes no changes to the game. Instead, it makes modding the game much easier.

The vanilla game has a couple mod hooks in it already. However, they are labelled as primitive and according to the changelog have been that way since they were introduced in 2014. This plus the innate silliness in having every add-on backup and replace the Game.UpdateMenu function led to the inspiration for this mod.

## How to use it

If you want to make an add-on that uses CCSE, just put this line at the top of your mod: 

```javascript
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE.js');
```

To wait for CCSE to finish loading before continuing to load your mod, frame your mod in this general style:

```javascript
if(MyMod === undefined) var MyMod = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE.js');

MyMod.launch = function(){
	/**
	
	All the code you want to delay goes here
	Put "MyMod.isLoaded = 1;" somewhere within
	
	**/
}

if(!MyMod.isLoaded){
	if(CCSE && CCSE.isLoaded){
		MyMod.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(MyMod.launch);
	}
}
```

## What can you do with CCSE?

More like what can't you do? Seriously, tell me if it can't do something you want it to do. Just make an issue [here](https://github.com/klattmose/klattmose.github.io/issues).

CCSE puts mod hooks in most of the functions in the game, as well as adds some helper functions to make soem things a little easier. Here's a quick and incomplete list of some of the features.

### Menu functions

There are four separate hooks into Game.UpdateMenu.

```javascript
Game.customMenu
Game.customOptionsMenu
Game.customStatsMenu
Game.customInfoMenu
```

To use these, just push your menu function into the array you choose, like so:

```javascript
Game.customMenu.push(MyMod.menuFunction);
```

Functions in the Game.customMenu will be called whenerver Game.UpdateMenu is called. The other three arrays are used when their particular menu is in focus (i.e. Game.customOptionsMenu functions are only called when the Options menu is open)

There are several functions in CCSE that make menu functions easier.
* CCSE.AppendOptionsMenu(inp)
	* Accepts input of either string or html element. Appends {inp} to the Options menu.
* CCSE.AppendCollapsibleOptionsMenu(title, body)
	* {title} must be a string, {body} can be either a string or html element. Appends {body} to the Options menu under a header with {title} as the text. The header has a button to hide {body}.
* CCSE.AppendStatsGeneral(inp)
	* Accepts input of either string or html element. Appends {inp} to the General section in the Stats menu.
* CCSE.AppendStatsSpecial(inp)
	* Accepts input of either string or html element. Appends {inp} to the Special section in the Stats menu.
* CCSE.AppendStatsVersionNumber(modName, versionString)
	* Both inputs must be strings. Adds a line in the format "{modName} version : {versionString} after the Game version in the General section of the Stats menu.

An example of how these functions might be used:
```javascript
Game.customOptionsMenu.push(function(){
	CCSE.AppendCollapsibleOptionsMenu(MyMod.name, MyMod.getMenuString());
});

Game.customStatsMenu.push(function(){
	CCSE.AppendStatsVersionNumber(MyMod.name, MyMod.version);
});
```
Of course, MyMod.name, MyMod.version, and MyMod.getMenuString must be declared elsewhere in your add-on.

### Saving data

If your mod or add-on has configuration choices or other data you'd like to persist between sessions, you'll have to save it at some point and load it later. You could write your own functions for that, or you could let CCSE handle that for you. How? 

```javascript
CCSE.customSave.push(function(){
	CCSE.config.OtherMods.MyMod = MyMod.config;
});
CCSE.customLoad.push(function(){
	if(CCSE.config.OtherMods.MyMod) MyMod.config = CCSE.config.OtherMods.MyMod; else MyMod.config = {};
	// Do other things if you want
});
```

This data gets saved very time the game is saved, and loaded every time the game is loaded. the CCSE section of the Options menu has buttons that let you export and import the custom save. If you desire to change the save manually you can use the following functions through the console:

```javascript
CCSE.ExportEditableSave();
CCSE.ImportEditableSave();
```

### Custom upgrades, achievements, buffs, and buildings

CCSE has functions to ease the creation of the above game items. 

* CCSE.NewUpgrade(name, desc, price, icon, buyFunction)
* CCSE.NewHeavenlyUpgrade(name, desc, price, icon, posX, posY, parents, buyFunction)
* CCSE.NewAchievement(name, desc, icon)
* CCSE.NewBuilding(name, commonName, desc, icon, iconColumn, art, price, cps, buyFunction, foolObject, buildingSpecial)
* CCSE.NewBuff(name, func)

If you use these functions, CCSE will know to save the created items automatically, with no extrea effort needed. In addition, the following base game functions have been altered so CCSE will know to save the resultant items:

* Game.TieredUpgrade
* Game.SynergyUpgrade
* Game.GrandmaSynergy
* Game.NewUpgradeCookie
* Game.TieredAchievement
* Game.ProductionAchievement
* Game.BankAchievement
* Game.CpsAchievement

### Miscellaneous functions

* CCSE.MinigameReplacer(func, objKey)

Use this function to delay the execution of code to after a minigame has loaded, or run it immediately if the minigame already is loaded. 

```javascript
CCSE.MinigameReplacer(MyMod.AlterGrimoire, 'Wizard tower');
```

* CCSE.AddMoreWrinklers(n)

Wrinklers are stored in an array. Use this function to add more.

* CCSE.CreateSpecialObject(name, conditionFunc, pictureFunc, drawFunc)

Special objects are Krumblor and Santa in the bottom left corner. You can totally make your own. 

* CCSE.ConfirmGameVersion(modName, modVersion, version)
* CCSE.ConfirmCCSEVersion(modName, modVersion, version)
* CCSE.ConfirmGameCCSEVersion(modName, modVersion, gameVersion, ccseVersion)

Use any one of these to preform a version check before loading the code. If the expected version is different from the current version, it shows a prompt allowing the user to cancel loading the mod. 

```javascript
if(CCSE.ConfirmGameVersion(MyMod.name, MyMod.version, MyMod.GameVersion)) MyMod.init();
```

## Demo mods

I made a few quick mods to show off the capability of CCSE and provide example code of some of its features.

### [Timer Widget](https://klattmose.github.io/CookieClicker/CCSE-POCs/TimerWidget.js)
```javascript
javascript: (function(){
	Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE-POCs/TimerWidget.js');
}());
```

If any part of this reminds you of the Timer Bar in Cookie Monster, there's a very good reason for that: large chunks of code were copied from Cookie Monster. 

Provides examples of: 
* Creating a special object next to Krumblor and Santa
* Displaying the version number in the Stats menu

### [Hurricane Sugar](https://klattmose.github.io/CookieClicker/CCSE-POCs/HurricaneSugar.js)
```javascript
javascript: (function(){
	Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE-POCs/HurricaneSugar.js');
}());
```

This adds a Golden Cookie effect that briefly shortens the time for sugar lumps to ripen to 1 second.

Provides examples of: 
* Creating a buff
* Altering sugar lump times when that buff is active
* Making a Golden Cookie effect activate that buff
* Letting Force the Hand of Fate pick the new buff
* Syncing up Fortune Cookie to be able to predict if FtHoF will call up the new effect

### [Black Hole Inverter](https://klattmose.github.io/CookieClicker/CCSE-POCs/BlackholeInverter.js)
```javascript
javascript: (function(){
	Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE-POCs/BlackholeInverter.js');
}());
```

This adds a new building and an appropriate amount of upgrades and achievments

Provides examples of: 
* Creating a building
* Creating upgrades
* Creating achievements

## Compatibility

CCSE sinks its grabby hooks into a huge number of the game's functions. I haven't done extensive testing with every single Cookie Clicker add-on in existence, so I can't give any definitives. Tell me of any conflicts you find and I'll add them to the list. 

* CCES must be loaded before Cookie Monster. (Load any mod that uses CCSE before Cookie Monster)

## Bugs and suggestions

Any bug or suggestion should be **opened as an issue** [in the repository](https://github.com/klattmose/klattmose.github.io/issues) for easier tracking. This allows me to close issues once they're fixed.

## Version History

**09/18/2021 - (2.029)**
* Fixed upgrade descriptions breaking in localization
* Added hooks for Game.crate and Game.createTooltip
* Custom links in the menu will now open in a browser rather than Steam
* Changed Game.Loader.Load injection to detect '/' instead of 'http'

**09/11/2021 - (2.028)**
* Added PasswordBox and CheckBox to MenuHelper
* Added function to append custom CSS styles
* Fixed bug in custom Background selector

**09/09/2021 - (2.027)**
* Added support for custom images for the Pantheon and Grimoire
* Added hooks for Steam.modsPopup
* Added support for custom Golden cookie sound selector options
* Added support for custom Milk selector options
* Added support for custom Background selector options

**09/01/2021 - (2.025)**
* Vaulting for custom upgrades no longer depends on mod load order
* Setting custom upgrades as Permanent will no longer break the game if the Stats menu is opened without the mod loaded
* Added some functions for commonly used menu items

**02/06/2021 - (2.023)**
* Optimized the initialization code
* Will now load in roughly a quarter of the time

**11/01/2020 - (2.020)**
* Changed CCSE.save to CCSE.config
* Incorporated new mod api from Cookie Clicker

**10/22/2019 - (2.016)**
* Added hook for the new function Game.auraMult

**05/14/2019 - parallel processing (2.015)**
* Won't freeze the game while CCSE is loading
* Also has a progress meter for feedback
* Bug fixes

**05/11/2019 - take two (2.003)**
* You know that moment where you do something and then immediately realize a better way to do it?
* Changed the method for injecting code to standardized functions rather than calling "eval" willy-nilly
* Added function for creating seasons
* Created an update log, and put the version number in the lower left corner

**05/05/2019 - initial release (1.0)**
* Added a bunch of mod hooks to the game
* Added functions to ease the creation of content like achievements and buildings
* Added a save system to manage game objects created through CCSE

## Special thanks

Anyone who gives a suggestion or bugfix, especially code that gets implemented into CCSE, will be listed here along with their contribution.

* klattmose
	* Writing this thing
* [Or0b0ur0s](https://www.reddit.com/user/Or0b0ur0s)
	* Assisting in making CCSE less strenuous on computers with fewer resources
* [G lander](https://www.reddit.com/user/G-lander)
	* Suggested using the prototype functions for upgrades instead of the individual functions
* [EntranceJew](https://github.com/EntranceJew)
	* Multiple code suggestions
