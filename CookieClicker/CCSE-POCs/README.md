# Cookie Clicker Script Extender (CCSE)

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

CCSE puts mod hooks in most of the functions in the game, as well as adds some helper functions to make soem things a little easier. Here's a quick list of some of the features

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
* CCSE.AppendOptionsMenu(inp): Accepts input of either string or html element. Appends {inp} to the Options menu.
* CCSE.AppendCollapsibleOptionsMenu(title, body): {title} must be a string, {body} can be either a string or html element. Appends {body} to the Options menu under a header with {title} as the text. The header has a button to hide {body}.
* CCSE.AppendStatsGeneral(inp): Accepts input of either string or html element. Appends {inp} to the General section in the Stats menu.
* CCSE.AppendStatsSpecial(inp): Accepts input of either string or html element. Appends {inp} to the Special section in the Stats menu.
* CCSE.AppendStatsVersionNumber(modName, versionString): Both inputs must be strings. Adds a line in the format "{modName} version : {versionString} after the Game version in the General section of the Stats menu.

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
	CCSE.save.OtherMods.MyMod = MyMod.config;
});
CCSE.customLoad.push(function(){
	if(CCSE.save.OtherMods.MyMod) MyMod.config = CCSE.save.OtherMods.MyMod; else MyMod.config = {};
});
```

This data gets saved very time the game is saved, and loaded every time the game is loaded. the CCSE section of the Options menu has buttons that let you export and import the custom save. If you desire to change the save manually you can use the following functions through the console:

```javascript
CCSE.ExportEditableSave();
CCSE.ImportEditableSave();
```

### Custom upgrades, achievements, buffs, and buildings

