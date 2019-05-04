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


