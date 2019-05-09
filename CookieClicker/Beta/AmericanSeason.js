if(Fireworks === undefined) var Fireworks = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (1 ? 'Beta/' : '') + 'CCSE.js');
Fireworks.name = 'American Season';
Fireworks.version = '0.2';
Fireworks.GameVersion = '2.019';

Fireworks.launch = function(){
	Fireworks.init = function(){
		var iconsURL = 'https://klattmose.github.io/CookieClicker/img/customIcons.png';
		
		
		var trigger = CCSE.NewUpgrade(
			'Explosive biscuit', 
			'Triggers <b>American season</b> for the next 24 hours.<br>Triggering another season will cancel this one.<br>Cost scales with unbuffed CpS and increases with every season switch.<q>Booooorn in the USA!</q>',
			Game.seasonTriggerBasePrice,
			[0, 4, iconsURL]
		);
		trigger.season = 'american';
		trigger.pool = 'toggle';
		trigger.order = 2 * Game.Upgrades['Bunny biscuit'].order - Game.Upgrades['Fool\'s biscuit'].order;
		trigger.descFunc = function(){return /*'<div style="text-align:center;">'+Game.listTinyOwnedUpgrades(Game.easterEggs)+'<br><br>You\'ve purchased <b>'+Game.GetHowManyEggs()+'/'+Game.easterEggs.length+'</b> eggs.<div class="line"></div>'+*/Game.saySeasonSwitchUses()+'<div class="line"></div></div>'+this.desc;};
		
		CCSE.NewSeason(
			'american', 
			new Date(new Date().getFullYear(), 7 - 1, 1), 
			new Date(new Date().getFullYear(), 7 - 1, 7), 
			{name:'American season',start:'American season has started!',over:'American season is over.',trigger:'Explosive biscuit'}, 
			[
				'Independence Day!',
				"It's <b>American season</b>!<br>Set off some fireworks and have a barbecue!",
				[0, 4, iconsURL]
			]
		);
		
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(Fireworks.name, Fireworks.version);
		});
		
		
		// Announce completion, set the isLoaded flag, and run any functions that were waiting for this to load
		if (Game.prefs.popups) Game.Popup('American Season loaded!');
		else Game.Notify('American Season loaded!', '', '', 1, 1);
		Fireworks.isLoaded = 1;
		for(var i in Fireworks.postloadHooks) Fireworks.postloadHooks[i]();
	}
	
	
	
	if(CCSE.ConfirmGameVersion(Fireworks.name, Fireworks.version, Fireworks.GameVersion)) Fireworks.init();
}

if(!Fireworks.isLoaded){
	if(CCSE && CCSE.isLoaded){
		Fireworks.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(Fireworks.launch);
	}
}