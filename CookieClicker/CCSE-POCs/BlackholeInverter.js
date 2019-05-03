Game.Win('Third-party');
if(BlackholeInverter === undefined) var BlackholeInverter = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (1 ? 'Beta/' : '') + 'CCSE.js');
BlackholeInverter.name = 'Black Hole Inverter';
BlackholeInverter.version = '1.0';
BlackholeInverter.GameVersion = '2.019';

BlackholeInverter.launch = function(){
	BlackholeInverter.init = function(){
		var iconsURL = 'https://klattmose.github.io/CookieClicker/img/customIcons.png';
		
		CCSE.NewBuilding('Black hole inverter',
			'black hole inverter|black hole inverters|extracted|[X]% larger event horizon|[X]% larger event horizon',
			'Runs cookies through various tests to prove their deliciousness.',
			1,
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
				customIconsPic:iconsURL
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
				icon:1
			}
		);
		
		Game.last.displayName='<span style="font-size:80%;position:relative;bottom:4px;">Black hole inverter</span>'; // Shrink the name since it's so large
		
		
		// Upgrades
		var last; var order = 1400; var i = 0;
		last = new Game.TieredUpgrade('Blacker holes', 'Black hole inverters are <b>twice</b> as efficient.<q>Bigger and blacker.</q>', 'Black hole inverter', 1); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('Blackest holes', 'Black hole inverters are <b>twice</b> as efficient.<q>The biggest and blackest.</q>', 'Black hole inverter', 2); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('Vantablack holes', 'Black hole inverters are <b>twice</b> as efficient.<q>The universe doesn\'t care about some idiot\'s copyright.</q>', 'Black hole inverter', 3); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('African-American holes', 'Black hole inverters are <b>twice</b> as efficient.<q>Some people take political correctness a little too far.</q>', 'Black hole inverter', 4); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('Event Horizon Comics', 'Black hole inverters are <b>twice</b> as efficient.<q>dot com</q>', 'Black hole inverter', 5); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('Large Hadron Collider', 'Black hole inverters are <b>twice</b> as efficient.<q>Smashing things together has never been so well funded!</q>', 'Black hole inverter', 6); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('Superconducting Super Collider', 'Black hole inverters are <b>twice</b> as efficient.<q>In the land of what might have been.</q>', 'Black hole inverter', 7); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('Hawking radiators', 'Black hole inverters are <b>twice</b> as efficient.<q>14 March 2018.</q>', 'Black hole inverter', 8); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('Micro black holes', 'Black hole inverters are <b>twice</b> as efficient.<q>Fun sized</q>', 'Black hole inverter', 9); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('Accretion disco', 'Black hole inverters are <b>twice</b> as efficient.<q>Everybody dance now!</q>', 'Black hole inverter', 10); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = new Game.TieredUpgrade('Gravitational waves', 'Black hole inverters are <b>twice</b> as efficient.<q>What\'s better that one black hole? Two of them put together!</q>', 'Black hole inverter', 11); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		
		order = 256;
		last = Game.GrandmaSynergy('Heavy grandmas', 'A dense grandma to accrete more cookies.', 'Black hole inverter'); last.icon[2] = iconsURL; last.order = order;
		
		order = 5001
		last = Game.SynergyUpgrade('Daring pilots', "<q>You've never heard of the Millennium Falcon? It's the ship that made the Kessel Run in less than twelve parsecs.</q>", 'Black hole inverter', 'Shipment', 'synergy1'); last.icon[2] = iconsURL; last.order = order;
		last = Game.SynergyUpgrade('General relativity', '<q>Space is time. Time is space</q>', 'Black hole inverter', 'Time machine', 'synergy2'); last.icon[2] = iconsURL; last.order = order + 0.01;
		
		
		// Achievements
		order = 2300; i = 0;
		last = Game.TieredAchievement('Single singularity', 'Have <b>1</b> black hole inverter.', 'Black hole inverter', 1); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = Game.TieredAchievement('Approach illusion', 'Have <b>50</b> black hole inverters.', 'Black hole inverter', 2); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = Game.TieredAchievement('Schwarzschild', 'Have <b>100</b> black hole inverters.', 'Black hole inverter', 3); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = Game.TieredAchievement('Primordial black holes', 'Have <b>150</b> black hole inverters.', 'Black hole inverter', 4); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = Game.TieredAchievement('No-hair theorem', 'Have <b>200</b> black hole inverters.', 'Black hole inverter', 5); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = Game.TieredAchievement('Photon sphere', 'Have <b>250</b> black hole inverters.', 'Black hole inverter', 6); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = Game.TieredAchievement('Information paradox', 'Have <b>300</b> black hole inverters.', 'Black hole inverter', 7); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = Game.TieredAchievement('Gravitaional lensing', 'Have <b>350</b> black hole inverters.', 'Black hole inverter', 8); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = Game.TieredAchievement('Galactic nuclei', 'Have <b>400</b> black hole inverters.', 'Black hole inverter', 9); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = Game.TieredAchievement('Sagittarius A*', 'Have <b>450</b> black hole inverters.', 'Black hole inverter', 10); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = Game.TieredAchievement('Hey now, you\'re a dead star', 'Have <b>500</b> black hole inverters.', 'Black hole inverter', 11); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		
		order = 2320; i = 0;
		last = Game.ProductionAchievement('Relativistic jets', 'Black hole inverter', 1); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = Game.ProductionAchievement('Primordial black holes', 'Black hole inverter', 2); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		last = Game.ProductionAchievement('Naked singularity', 'Black hole inverter', 3); last.icon[2] = iconsURL; last.order = order + i / 100; i++;
		
		last = new Game.Achievement('M87', 'Reach level <b>10</b> black hole inverters.', [0, 26, iconsURL]); 
			Game.Objects['Black hole inverter'].levelAchiev10 = last; last.order = order + i / 100; i++;
		
		
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