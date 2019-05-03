Game.Win('Third-party');
if(BlackholeInverter === undefined) var BlackholeInverter = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (1 ? 'Beta/' : '') + 'CCSE.js');
BlackholeInverter.name = 'Black Hole Inverter';
BlackholeInverter.version = '0.2';
BlackholeInverter.GameVersion = '2.019';

BlackholeInverter.launch = function(){
	BlackholeInverter.init = function(){
		
		CCSE.NewBuilding('Black hole inverter',
			'black hole inverter|black hole inverters|extracted|[X]% larger event horizon|[X]% larger event horizon',
			'Runs cookies through various tests to prove their deliciousness.',
			0,
			0,
			{
				base:'https://klattmose.github.io/CookieClicker/img/blackholeinverter',
				xV:8,
				yV:64,
				w:64,
				rows:1,
				x:0,
				y:0,
				customBuildingPic:'https://klattmose.github.io/CookieClicker/img/customBuildings.png',
				customIconsPic:'https://klattmose.github.io/CookieClicker/img/customIcons.png'
			},
			"doesn't matter what you put here",
			function(me){
				var mult = 1;
				mult *= Game.GetTieredCpsMult(me);
				mult *= Game.magicCpS(me.name);
				return me.baseCps * mult;
			},
			function(){
				Game.UnlockTiered(this);
				if(this.amount >= Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount > 0) Game.Unlock(this.grandma.name);
			},
			{
				name:'Hypnodrone',
				desc:'Autonomous aerial brand ambassadors to "encourage" more sales!',
				icon:0
			}
		);
		
		Game.last.displayName='<span style="font-size:80%;position:relative;bottom:4px;">Black hole inverter</span>';//shrink the name since it's so large
		
		
		var last; var order = 1400; var i = 0;
		last = new Game.TieredUpgrade('TieredUpgrade 1', 'Black hole inverters are <b>twice</b> as efficient.<q>Quote 1.</q>', 'Black hole inverter', 1); last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('TieredUpgrade 2', 'Black hole inverters are <b>twice</b> as efficient.<q>Quote 2.</q>', 'Black hole inverter', 2); last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('TieredUpgrade 3', 'Black hole inverters are <b>twice</b> as efficient.<q>Quote 3.</q>', 'Black hole inverter', 3); last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('TieredUpgrade 4', 'Black hole inverters are <b>twice</b> as efficient.<q>Quote 4.</q>', 'Black hole inverter', 4); last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('TieredUpgrade 5', 'Black hole inverters are <b>twice</b> as efficient.<q>Quote 5.</q>', 'Black hole inverter', 5); last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('TieredUpgrade 6', 'Black hole inverters are <b>twice</b> as efficient.<q>Quote 6.</q>', 'Black hole inverter', 6); last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('TieredUpgrade 7', 'Black hole inverters are <b>twice</b> as efficient.<q>Quote 7.</q>', 'Black hole inverter', 7); last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('TieredUpgrade 8', 'Black hole inverters are <b>twice</b> as efficient.<q>Quote 8.</q>', 'Black hole inverter', 8); last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('TieredUpgrade 9', 'Black hole inverters are <b>twice</b> as efficient.<q>Quote 9.</q>', 'Black hole inverter', 9); last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('TieredUpgrade 10', 'Black hole inverters are <b>twice</b> as efficient.<q>Quote 10.</q>', 'Black hole inverter', 10); last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('TieredUpgrade 11', 'Black hole inverters are <b>twice</b> as efficient.<q>Quote 11.</q>', 'Black hole inverter', 11); last.order = order + i / 100; i++;
		
		order = 256;
		last = Game.GrandmaSynergy('Heavy grandmas', 'A dense grandma to accrete more cookies.', 'Black hole inverter'); last.order = order;
		
		order = 5001
		last = Game.SynergyUpgrade('Daring pilots', "<q>You've never heard of the Millennium Falcon? It's the ship that made the Kessel Run in less than twelve parsecs.</q>", 'Black hole inverter', 'Shipment', 'synergy1'); last.order = order;
		last = Game.SynergyUpgrade('General relativity', '', 'Black hole inverter', 'Time machine', 'synergy2'); last.order = order + 0.01;
		
		
		order = 2300; i = 0;
		last = Game.TieredAchievement('TieredAchievement 1', 'Have <b>1</b> black hole inverter.', 'Black hole inverter', 1); last.order = order + i / 100; i++;
		last = Game.TieredAchievement('TieredAchievement 2', 'Have <b>50</b> black hole inverters.', 'Black hole inverter', 2); last.order = order + i / 100; i++;
		last = Game.TieredAchievement('TieredAchievement 3', 'Have <b>100</b> black hole inverters.', 'Black hole inverter', 3); last.order = order + i / 100; i++;
		last = Game.TieredAchievement('TieredAchievement 4', 'Have <b>150</b> black hole inverters.', 'Black hole inverter', 4); last.order = order + i / 100; i++;
		last = Game.TieredAchievement('TieredAchievement 5', 'Have <b>200</b> black hole inverters.', 'Black hole inverter', 5); last.order = order + i / 100; i++;
		last = Game.TieredAchievement('TieredAchievement 6', 'Have <b>250</b> black hole inverters.', 'Black hole inverter', 6); last.order = order + i / 100; i++;
		last = Game.TieredAchievement('TieredAchievement 7', 'Have <b>300</b> black hole inverters.', 'Black hole inverter', 7); last.order = order + i / 100; i++;
		last = Game.TieredAchievement('TieredAchievement 8', 'Have <b>350</b> black hole inverters.', 'Black hole inverter', 8); last.order = order + i / 100; i++;
		last = Game.TieredAchievement('TieredAchievement 9', 'Have <b>400</b> black hole inverters.', 'Black hole inverter', 9); last.order = order + i / 100; i++;
		last = Game.TieredAchievement('TieredAchievement 10', 'Have <b>450</b> black hole inverters.', 'Black hole inverter', 10); last.order = order + i / 100; i++;
		last = Game.TieredAchievement('TieredAchievement 11', 'Have <b>500</b> black hole inverters.', 'Black hole inverter', 11); last.order = order + i / 100; i++;
		
		
		// Finish up
		BlackholeInverter.isLoaded = 1;
		if(BlackholeInverter.postloadHooks){
			for(var i = 0; i < BlackholeInverter.postloadHooks.length; ++i) BlackholeInverter.postloadHooks[i]();
		}
		if (Game.prefs.popups) Game.Popup(BlackholeInverter.name + ' loaded!');
		else Game.Notify(BlackholeInverter.name + ' loaded!', '', '', 1, 1);
	}
	
	
	BlackholeInverter.init();
}


if(!BlackholeInverter.isLoaded){
	if(CCSE && CCSE.isLoaded){
		BlackholeInverter.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(BlackholeInverter.launch);
	}
}