if(AmericanSeason === undefined) var AmericanSeason = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (1 ? 'Beta/' : '') + 'CCSE.js');
AmericanSeason.name = 'American Season';
AmericanSeason.version = '1.4';
AmericanSeason.GameVersion = '2.031';

AmericanSeason.launch = function(){
	AmericanSeason.init = function(){
		AmericanSeason.iconsURL = 'https://klattmose.github.io/CookieClicker/img/customIcons.png';
		AmericanSeason.config = AmericanSeason.defaultConfig();
		AmericanSeason.rocketsPopped = 0;
		//AmericanSeason.load();
		if(CCSE.config.OtherMods.AmericanSeason && !Game.modSaveData[AmericanSeason.name]) Game.modSaveData[AmericanSeason.name] = JSON.stringify(CCSE.config.OtherMods.AmericanSeason);
		
		
		AmericanSeason.createSeason();
		AmericanSeason.createUpgrades();
		AmericanSeason.createAchievements();
		AmericanSeason.createShimmer();
		AmericanSeason.createCanvas();
		AmericanSeason.initFireworks();
		
		
		Game.registerHook('logic', AmericanSeason.Logic);
		Game.registerHook('reset', AmericanSeason.Reset);
		/*CCSE.customLoad.push(AmericanSeason.load);
		CCSE.customSave.push(AmericanSeason.save);*/
		Game.registerHook('cps', AmericanSeason.GetModifiedCPS);
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(AmericanSeason.name, AmericanSeason.version);
			if(AmericanSeason.rocketsPopped) CCSE.AppendStatsSpecial('<div class="listing"><b>Rockets exploded :</b> ' + AmericanSeason.rocketsPopped + '</div>');
		});
		Game.customOptionsMenu.push(function(){
			CCSE.AppendCollapsibleOptionsMenu(AmericanSeason.name, AmericanSeason.getMenuString());
		});
		
		
		// Announce completion, set the isLoaded flag, and run any functions that were waiting for this to load
		if (Game.prefs.popups) Game.Popup('American Season loaded!');
		else Game.Notify('American Season loaded!', '', '', 1, 1);
		AmericanSeason.isLoaded = 1;
		for(var i in AmericanSeason.postloadHooks) AmericanSeason.postloadHooks[i]();
	}
	
	
	//***********************************
	//    Menu/config
	//***********************************
	AmericanSeason.getMenuString = function(){
		function header(text){
			return '<div class="listing" style="padding:5px 16px;opacity:0.7;font-size:17px;font-family:\\"Kavoon\\", Georgia, serif;">' + text + '</div>';
		}
		
		function inputBoxListing(prefName, prefDisplayName, desc){
			var listing = '<div class="listing">';
			listing += '<input id="AS_' + prefName + '" class="option" style="width:65px;" value="' + AmericanSeason.config[prefName] + '" onChange="AmericanSeason.UpdatePref(\'' + prefName + '\', this.value)"></input>'
			listing += '<label>' + prefDisplayName + (desc ? ' : ' + desc : '') + '</label>';
			listing += '</div>';
			return listing;
		}
		
		function ToggleButton(prefName, button, on, off, callback, invert){
			var invert = invert ? 1 : 0;
			if(!callback) callback = '';
			callback += 'PlaySound(\'snd/tick.mp3\');';
			return '<a class="option' + ((AmericanSeason.config[prefName]^invert) ? '' : ' off') + '" id="' + button + '" ' + Game.clickStr + '="AmericanSeason.Toggle(\'' + prefName + '\', \'' + button + '\', \'' + on + '\', \'' + off + '\', \'' + invert + '\');' + callback + '">' + (AmericanSeason.config[prefName] ? on : off) + '</a>';
		}
		
		var str = '<div class="listing"><a class="option" ' + Game.clickStr + '="AmericanSeason.config = AmericanSeason.defaultConfig(); PlaySound(\'snd/tick.mp3\'); Game.UpdateMenu();">Restore Default</a></div>';
		str += '<div class="listing">' + ToggleButton('SHOW_CANVAS', 'SHOW_CANVASButton', 'Canvas ON', 'Canvas OFF', '') + '<label>Display fireworks in the left panel. Inhibits clicking wrinklers.</label></div>';
		
		str += header('Projectiles');
		str += inputBoxListing('FIREWORK_ACCELERATION', 'Base firework acceleration', '1.0 causes fireworks to travel at a constant speed');
		str += inputBoxListing('FIREWORK_BRIGHTNESS_MIN', 'Minimum firework brightness');
		str += inputBoxListing('FIREWORK_BRIGHTNESS_MAX', 'Maximum firework brightness');
		str += inputBoxListing('FIREWORK_SPEED', 'Base speed of fireworks');
		str += inputBoxListing('FIREWORK_TRAIL_LENGTH', 'Base length of firework trails');
		
		str += header('Stars');
		str += '<div class="listing"><label>The pretty lights that explode out of a firework are called stars</label></div>';
		str += inputBoxListing('STAR_BRIGHTNESS_MIN', 'Minimum star brightness');
		str += inputBoxListing('STAR_BRIGHTNESS_MAX', 'Maximum star brightness');
		str += inputBoxListing('STAR_COUNT', 'Base star count per firework');
		str += inputBoxListing('STAR_DECAY_MIN', 'Minimum star decay rate');
		str += inputBoxListing('STAR_DECAY_MAX', 'Maximum star decay rate');
		str += inputBoxListing('STAR_FRICTION', 'Base star friction', 'Slows the speed of particles over time');
		str += inputBoxListing('STAR_GRAVITY', 'Base star gravity', 'How quickly particles move toward a downward trajectory');
		str += inputBoxListing('STAR_HUE_VARIANCE', 'Variance in star coloration');
		str += inputBoxListing('STAR_TRANSPARENCY', 'Base star transparency');
		str += inputBoxListing('STAR_SPEED_MIN', 'Minimum star speed');
		str += inputBoxListing('STAR_SPEED_MAX', 'Maximum star speed');
		str += inputBoxListing('STAR_TRAIL_LENGTH', 'Base length of explosion star trails');
		
		str += header('Other');
		str += inputBoxListing('CANVAS_CLEANUP_ALPHA', 'Cleanup rate', 'Lower value increases trail duration');
		str += inputBoxListing('HUE_STEP_INCREASE', 'Hue change per loop', 'Used to rotate through different firework colors');
		str += inputBoxListing('STROKE_WIDTH', 'Line width for canvas strokes');
		str += inputBoxListing('TICKS_PER_FIREWORK_MIN', 'Minimum number of ticks per manual firework launch');
		str += inputBoxListing('GLOBAL_COMPOSITE_OPERATION', 'Override for globalCompositeOperation', 'See <a href="https://www.w3schools.com/tags/canvas_globalcompositeoperation.asp" target="_blank">here</a>.');
		
		return str;
	}
	
	AmericanSeason.defaultConfig = function(){
		return {
			SHOW_CANVAS					: true,		// Display fireworks in the left panel.
			
			FIREWORK_ACCELERATION		: 1.1,		// Base firework acceleration. // 1.0 causes fireworks to travel at a constant speed. // Higher number increases rate firework accelerates over time.
			FIREWORK_BRIGHTNESS_MIN		: 50,		// Minimum firework brightness.
			FIREWORK_BRIGHTNESS_MAX		: 70,		// Maximum firework brightness.
			FIREWORK_SPEED				: 10,		// Base speed of fireworks.
			FIREWORK_TRAIL_LENGTH	 	: 3,		// Base length of firework trails.
			
			STAR_BRIGHTNESS_MIN			: 50,		// Minimum star brightness.
			STAR_BRIGHTNESS_MAX			: 80,		// Maximum star brightness.
			STAR_COUNT					: 100,		// Base star count per firework.
			STAR_DECAY_MIN				: 0.015,	// Minimum star decay rate.
			STAR_DECAY_MAX				: 0.03,		// Maximum star decay rate.
			STAR_FRICTION				: 0.9,		// Base star friction. // Slows the speed of particles over time.
			STAR_GRAVITY				: 1.4,		// Base star gravity. // How quickly particles move toward a downward trajectory.
			STAR_HUE_VARIANCE			: 20,		// Variance in star coloration.
			STAR_TRANSPARENCY	 		: 1,		// Base star transparency.
			STAR_SPEED_MIN				: 2,		// Minimum star speed.
			STAR_SPEED_MAX				: 20,		// Maximum star speed.
			STAR_TRAIL_LENGTH			: 5,		// Base length of explosion star trails.
			
			CANVAS_CLEANUP_ALPHA		: 0.2,		// Alpha level that canvas cleanup iteration removes existing trails. // Lower value increases trail duration.
			HUE_STEP_INCREASE			: 1,		// Hue change per loop, used to rotate through different firework colors.
			
			TICKS_PER_FIREWORK_MIN		: 5,		// Minimum number of ticks per manual firework launch.
			STROKE_WIDTH				: 1,		// Line width for canvas strokes.
			GLOBAL_COMPOSITE_OPERATION	: 'default',// Override for globalCompositeOperation
		}
	}
	
	AmericanSeason.save = function(){
		/*CCSE.config.OtherMods.AmericanSeason = {
			config : AmericanSeason.config,
			rocketsPopped : AmericanSeason.rocketsPopped
		}*/
		
		if(CCSE.config.OtherMods.AmericanSeason) delete CCSE.config.OtherMods.AmericanSeason; // no need to keep this, it's now junk data
		return JSON.stringify({
			config : AmericanSeason.config,
			rocketsPopped : AmericanSeason.rocketsPopped
		});
	}
	
	AmericanSeason.load = function(str){
		var obj = JSON.parse(str);
//		if(CCSE.config.OtherMods.AmericanSeason){
			var config = obj.config;
			for(var pref in config){
				AmericanSeason.config[pref] = config[pref];
			}
			
			if(obj.rocketsPopped !== undefined)
				AmericanSeason.rocketsPopped = obj.rocketsPopped;
//		}
		
	}
	
	AmericanSeason.UpdatePref = function(prefName, value){
		var val = parseFloat(value);
		if(!isNaN(val)) AmericanSeason.config[prefName] = val;
		if(prefName == 'GLOBAL_COMPOSITE_OPERATION') AmericanSeason.config[prefName] = value;
		Game.UpdateMenu();
	}
	
	AmericanSeason.Toggle = function(prefName, button, on, off, invert){
		if(AmericanSeason.config[prefName]){
			l(button).innerHTML = off;
			AmericanSeason.config[prefName] = 0;
		}
		else{
			l(button).innerHTML = on;
			AmericanSeason.config[prefName] = 1;
		}
		l(button).className = 'option' + ((AmericanSeason.config[prefName] ^ invert) ? '' : ' off');
	}
	
	AmericanSeason.Reset = function(hard){
		AmericanSeason.rocketsPopped = 0;
	}
	
	
	//***********************************
	//    Create game objects
	//***********************************
	AmericanSeason.createSeason = function(){
		var trigger = CCSE.NewUpgrade(
			'Explosive biscuit', 
			'Triggers <b>American season</b> for the next 24 hours.<br>Triggering another season will cancel this one.<br>Cost scales with unbuffed CpS and increases with every season switch.<q>Hold my beer and watch this</q>',
			Game.seasonTriggerBasePrice,
			[0, 4, AmericanSeason.iconsURL]
		);
		trigger.season = 'american';
		trigger.pool = 'toggle';
		trigger.order = 2 * Game.Upgrades['Bunny biscuit'].order - Game.Upgrades['Fool\'s biscuit'].order;
		trigger.descFunc = function(){
			var desc = '<div style="text-align:center;">' + Game.listTinyOwnedUpgrades(AmericanSeason.upgrades) + '<br><br>' +
						'You\'ve purchased <b>' + AmericanSeason.GetHowManyFireworkDrops() + '/' + AmericanSeason.upgrades.length + '</b> firework upgrades.<div class="line"></div>' +
						Game.saySeasonSwitchUses() + '<div class="line"></div></div>' + this.desc;
			return desc;
		};
		
		CCSE.NewSeason(
			'american', 
			new Date(new Date().getFullYear(), 7 - 1, 1), 
			new Date(new Date().getFullYear(), 7 - 1, 7), 
			{name:'American season', start:'American season has started!', over:'American season is over.', trigger:'Explosive biscuit'}, 
			[
				'Independence Day!',
				"It's <b>American season</b>!<br>Set off some fireworks and have a barbecue!",
				[0, 4, AmericanSeason.iconsURL]
			]
		);
		
		Game.registerHook('ticker', function(){
			var list = [];
			if(Game.season == 'american' && Game.cookiesEarned >= 1000) list.push(choose([
				'News : flocks of eagles spotted circling over wig stores!',
				'News : debate rages across the county over whether grilling burgers and steaks counts as barbecue; militias prepare for combat.',
				'News : strange lights spotted at night over rivers and parks; official explanation satisfies few.',
				'News : continual loud noises disrupting sleep patterns for children of all ages; "things just keep exploding" exhausted mother says.'
			]));
			return list;
		});
	}
	
	AmericanSeason.createUpgrades = function(){
		AmericanSeason.upgrades = [];
		AmericanSeason.fireworkTypes = [];
		AmericanSeason.shimmerModifiers = [];
		
		var last;
		var order = Game.Upgrades["Santa's dominion"].order + 1 / 1000;
		var upPrice  = 999999999999;
		var upPrice2 = 99999999999999;
		
		last = CCSE.NewUpgrade('Ring burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q>O say can you see, by the dawn\'s early light</q>', upPrice, [1, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		last = CCSE.NewUpgrade('Peony burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q>What so proudly we hailed at the twilight\'s last gleaming</q>', upPrice, [2, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		last = CCSE.NewUpgrade('Palm burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q>Whose broad stripes and bright stars through the perilous fight</q>', upPrice, [3, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		last = CCSE.NewUpgrade('Bees burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q>O\'er the ramparts we watched, were so gallantly streaming?</q>', upPrice, [4, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		last = CCSE.NewUpgrade('Crossette burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q>And the rockets\' red glare, the bombs bursting in air</q>', upPrice, [5, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		last = CCSE.NewUpgrade('Waterfall burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q>Gave proof through the night that our flag was still there</q>', upPrice, [6, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		last = CCSE.NewUpgrade('Pearl burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q>O say does that star-spangled banner yet wave</q>', upPrice, [7, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		last = CCSE.NewUpgrade('Pistil burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q>O\'er the land of the free and the home of the brave?</q>', upPrice, [8, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		
		last = CCSE.NewUpgrade('Short fuse', 'Fireworks appear <b>twice as frequently</b>.<br>Cost scales with how many firework upgrades you own.<q>Swish</q>', upPrice2, [0, 5, AmericanSeason.iconsURL]); AmericanSeason.shimmerModifiers.push(last.name);
		last = CCSE.NewUpgrade('Slow burn', 'Fireworks fly <b>half as fast</b>.<br>Cost scales with how many firework upgrades you own.<q>Fwoosh</q>', upPrice2, [1, 5, AmericanSeason.iconsURL]); AmericanSeason.shimmerModifiers.push(last.name);
		last = CCSE.NewUpgrade('High explosive', 'Fireworks give <b>twice as much</b>.<br>Cost scales with how many firework upgrades you own.<q>BOOM!</q>', upPrice2, [2, 5, AmericanSeason.iconsURL]); AmericanSeason.shimmerModifiers.push(last.name);
		
		
		AmericanSeason.upgrades = AmericanSeason.fireworkTypes.concat(AmericanSeason.shimmerModifiers);
		Game.seasonDrops = Game.seasonDrops.concat(AmericanSeason.upgrades);
		
		for(var i in AmericanSeason.upgrades){
			var me = Game.Upgrades[AmericanSeason.upgrades[i]];
			me.order = order + i / 1000;
		}
		
		for(var i in AmericanSeason.fireworkTypes){
			Game.Upgrades[AmericanSeason.fireworkTypes[i]].priceFunc = function(){
				return Math.pow(2, AmericanSeason.GetHowManyFireworkDrops()) * 999;
			}
		}
		
		for(var i in AmericanSeason.shimmerModifiers){
			Game.Upgrades[AmericanSeason.shimmerModifiers[i]].priceFunc = function(){
				return Math.pow(3, AmericanSeason.GetHowManyFireworkDrops()) * 999;
			}
		}
		
		// Other upgrades
		last = CCSE.NewUpgrade('Grand finale', 'Rockets spawn much more frequently.<q>Fireworks and flamethrowers: a match made in hell.</q>', 7, [0, 4, AmericanSeason.iconsURL], function(){
			// Simulate Game.killShimmers
			var me = Game.shimmerTypes['rocket'];
			if(me.reset) me.reset();
			me.n = 0;
			if(me.spawnsOnTimer){
				me.time = 0;
				me.spawned = 0;
				me.minTime = me.getMinTime(me);
				me.maxTime = me.getMaxTime(me);
			}
		}); last.order = Game.Upgrades['Reindeer season'].order + 0.0001;
			last.pool = 'debug';
		last = CCSE.NewHeavenlyUpgrade('Starburst', 'Firework upgrades drop <b>5%</b> more often.<br>Rockets appear <b>5%</b> more often.', 111111, [0, 4, AmericanSeason.iconsURL], -630, 111, ['Season switcher']);
			Game.Upgrades["Keepsakes"].parents.push(last);
			Game.Upgrades["Starsnow"].posX = -630; Game.Upgrades["Starsnow"].posY = -344;
			Game.Upgrades["Starlove"].posX = -685; Game.Upgrades["Starlove"].posY = -255;
			Game.Upgrades["Starterror"].posX = -720; Game.Upgrades["Starterror"].posY = -166;
			Game.Upgrades["Startrade"].posX = -720; Game.Upgrades["Startrade"].posY = -77;
			Game.Upgrades["Starspawn"].posX = -685; Game.Upgrades["Starspawn"].posY = 22;
	}
	
	AmericanSeason.createShimmer = function(){
		var shimmerTypeName = 'rocket';
		
		var shimmer = {
			reset: function(){
			},
			initFunc: function(me){
				if(!this.spawned && Game.chimeType == 1 && Game.ascensionMode != 1) PlaySound('snd/rocketLaunch.mp3');
				
				me.x = Math.floor(Math.random() * Math.max(0, Game.bounds.right - Game.bounds.left - 256) + Game.bounds.left + 128) - 128;
				me.y = Game.bounds.bottom;
				me.l.style.width = '74px';
				me.l.style.height = '244px';
				me.l.style.backgroundImage = 'url("https://klattmose.github.io/CookieClicker/img/rocket.png")';
				me.l.style.backgroundSize = '74px 244px';
				me.l.style.opacity = '0';
				me.l.style.display = 'block';
				
				var dur = 2; // Base time in seconds to travel across the screen
				if(Game.Has('Slow burn')) dur *= 2;
				//dur *= Game.eff('reindeerDur');
				me.dur = dur;
				me.life = Math.ceil(Game.fps * me.dur);
				me.sizeMult = 1;
			},
			updateFunc: function(me){
				var curve = 1 - Math.pow((me.life / (Game.fps * me.dur)) * 2 - 1, 12);
				me.l.style.opacity = curve;
				me.l.style.transform = 'translate(' + me.x + 'px,' + (me.y + (Game.bounds.top - me.y - 244*2) * (1 - me.life / (Game.fps * me.dur))) + 'px) scale(' + (me.sizeMult * (1 + Math.sin(me.id * 0.53) * 0.1)) + ')';
				me.life--;
				if(me.life <= 0){
					this.missFunc(me);
					me.die();
				}
			},
			popFunc: function(me){
				if(me.spawnLead){
					AmericanSeason.rocketsPopped++;
				}
				
				var val = Game.cookiesPs * 60;
				var moni = Math.max(25, val); //1 minute of cookie production, or 25 cookies - whichever is highest
				if(Game.Has('High explosive')) moni *= 2;
				Game.Earn(moni);
				
				var upgrade = '';
				var failRate = 0.8;
				if(Game.HasAchiev('Full barrage')) failRate = 0.6;
				failRate *= 1 / Game.dropRateMult();
				if(Game.Has('Starburst')) failRate *= 0.95;
				if(Game.hasGod){
					var godLvl = Game.hasGod('seasons');
					if(godLvl == 1) failRate *= 0.9;
					else if(godLvl == 2) failRate *= 0.95;
					else if(godLvl == 3) failRate *= 0.97;
				}
				if(Math.random() > failRate){ // fireworks upgrades drops
					upgrade = choose(AmericanSeason.upgrades);
					if(!Game.HasUnlocked(upgrade) && !Game.Has(upgrade)) {
						Game.Unlock(upgrade);
					}
					else upgrade = '';
				}
				
				var popup = '';
				
				if(Game.prefs.popups) Game.Popup(choose(['Ooooh!','Aaaah!']) + '<br>The rocket gives you ' + Beautify(moni) + ' cookies.' + (upgrade == '' ? '' : '<br>You are also rewarded with ' + upgrade + '!'));
				else Game.Notify(choose(['Ooooh!','Aaaah!']), 'The rocket gives you ' + Beautify(moni) + ' cookies.' + (upgrade == '' ? '' : '<br>You are also rewarded with ' + upgrade + '!'), [0, 4, AmericanSeason.iconsURL], 6);
				popup = '<div style="font-size:80%;">+' + Beautify(moni) + ' cookies!</div>';
				
				if(popup != '') Game.Popup(popup, Game.mouseX, Game.mouseY);
				
				//sparkle and kill the shimmer
				Game.SparkleAt(Game.mouseX, Game.mouseY);
				PlaySound('snd/rocketBoom.mp3');
				me.die();
			},
			missFunc: function(me){
			},
			spawnsOnTimer: true,
			spawnConditions: function(){
				if (Game.season == 'american') return true; else return false;
			},
			spawned: 0,
			time: 0,
			minTime: 0,
			maxTime: 0,
			getTimeMod: function(me, m){
				if(Game.Has('Short fuse')) m /= 2;
				if(Game.Has('Starburst')) m *= 0.95;
				if(Game.hasGod){
					var godLvl = Game.hasGod('seasons');
					if(godLvl == 1) m *= 0.9;
					else if(godLvl == 2) m *= 0.95;
					else if(godLvl == 3) m *= 0.97;
				}
				if (Game.Has('Grand finale')) m = 0.01;
				return Math.ceil(Game.fps * 60 * m);
			},
			getMinTime: function(me){
				var m = 3;
				return this.getTimeMod(me, m);
			},
			getMaxTime: function(me){
				var m = 6;
				return this.getTimeMod(me, m);
			},
		}
		
		Game.shimmerTypes[shimmerTypeName] = shimmer;
		CCSE.ReplaceShimmerType(shimmerTypeName);
		
		// Simulate Game.killShimmers
		var me = Game.shimmerTypes[shimmerTypeName];
		if(me.reset) me.reset();
		me.n = 0;
		if(me.spawnsOnTimer){
			me.time = 0;
			me.spawned = 0;
			me.minTime = me.getMinTime(me);
			me.maxTime = me.getMaxTime(me);
		}
		
		// Preload sound effects
		Sounds['snd/rocketLaunch.mp3'] = new Audio('https://klattmose.github.io/CookieClicker/snd/rocketLaunch.mp3');
		Sounds['snd/rocketBoom.mp3'] = new Audio('https://klattmose.github.io/CookieClicker/snd/rocketBoom.mp3');
	}
	
	AmericanSeason.createAchievements = function(){
		var last;
		var order = Game.Achievements['Hide & seek champion'].order + 0.001;
		
		last = CCSE.NewAchievement('Pyrotechnics', 'Explode <b>1 rocket</b>', [0, 5, AmericanSeason.iconsURL]); last.order = order; order += 0.001;
		last = CCSE.NewAchievement('July 4th', 'Explode <b>74 rockets</b>', [1, 5, AmericanSeason.iconsURL]); last.order = order; order += 0.001;
		last = CCSE.NewAchievement('Pyromaniac', 'Explode <b>1776 rockets</b>', [2, 5, AmericanSeason.iconsURL]); last.pool = 'shadow'; last.order = order; order += 0.001;
		
		last = CCSE.NewAchievement('Full barrage', 'Unlock <b>every fireworks upgrade.</b><div class="line"></div>Owning this achievement makes fireworks upgrades drop more frequently in future playthroughs.', [0, 4, AmericanSeason.iconsURL]);
			last.order = order; order += 0.001;
		
		Game.registerHook('check', function(){
			if(AmericanSeason.rocketsPopped >= 1) Game.Win('Pyrotechnics');
			if(AmericanSeason.rocketsPopped >= 74) Game.Win('July 4th');
			if(AmericanSeason.rocketsPopped >= 1776) Game.Win('Pyromaniac');
			
			var haveAll = true;
			for(var i in AmericanSeason.upgrades){
				if(!Game.Has(AmericanSeason.upgrades[i])) haveAll = false;
			}
			if(haveAll) Game.Win('Full barrage');
		});
	}
	
	AmericanSeason.createCanvas = function(){
		var canvas = document.createElement('canvas');
		canvas.id = 'AmericanSeasonFireworksDisplay';
		canvas.style.zIndex = '100';
		canvas.style.position = 'absolute';
		canvas.style.left = '0px';
		canvas.style.top = '0px';
		l('sectionLeft').appendChild(canvas);
		
		canvas.width = canvas.parentNode.offsetWidth;
		canvas.height = canvas.parentNode.offsetHeight - 21;
		
		AmericanSeason.canvas = canvas;
		AmericanSeason.context = canvas.getContext('2d');
		
		window.addEventListener('resize', function(event){
			canvas.width = canvas.parentNode.offsetWidth;
			canvas.height = canvas.parentNode.offsetHeight - 21;
		});
	}
	
	
	//***********************************
	//    Fireworks on the left
	//***********************************
	AmericanSeason.initFireworks = function(){
		AmericanSeason.fireworks = [];
		AmericanSeason.stars = [];
		AmericanSeason.hue = 120;
		AmericanSeason.ticksSinceFirework = 0;
	}
	
	AmericanSeason.Firework = function(startX, startY, endX, endY){
		this.x = startX;
		this.y = startY;
		this.startX = startX;
		this.startY = startY;
		this.endX = endX;
		this.endY = endY;
		this.globalCompositeOperation = (AmericanSeason.config.GLOBAL_COMPOSITE_OPERATION == 'default' ? 'lighter' : AmericanSeason.config.GLOBAL_COMPOSITE_OPERATION);
		
		this.distanceToEnd = AmericanSeason.calculateDistance(startX, startY, endX, endY);
		this.distanceTraveled = 0;
		
		this.trail = [];
		this.trailLength = AmericanSeason.config.FIREWORK_TRAIL_LENGTH;
		while(this.trailLength--) {
			this.trail.push([this.x, this.y]);
		}
		
		this.angle = Math.atan2(endY - startY, endX - startX);
		this.speed = AmericanSeason.config.FIREWORK_SPEED;
		this.acceleration = AmericanSeason.config.FIREWORK_ACCELERATION;
		this.brightness = AmericanSeason.randBetween(AmericanSeason.config.FIREWORK_BRIGHTNESS_MIN, AmericanSeason.config.FIREWORK_BRIGHTNESS_MAX);
		this.lineWidth	= AmericanSeason.config.STROKE_WIDTH;
		this.lineCap = "round";
		
		
		this.update = function(index){
			this.trail.pop(); // Remove the oldest trail star.
			this.trail.unshift([this.x, this.y]); // Add the current position to the start of trail.
			
			this.speed *= this.acceleration; // Increase speed based on acceleration rate.
		 
			var xVelocity = Math.cos(this.angle) * this.speed;
			var yVelocity = Math.sin(this.angle) * this.speed;
			
			this.distanceTraveled = AmericanSeason.calculateDistance(this.startX, this.startY, this.x + xVelocity, this.y + yVelocity);
			
			if(this.distanceTraveled >= this.distanceToEnd) {
				AmericanSeason.fireworks.splice(index, 1);
				AmericanSeason.createParticles(this.endX, this.endY);      
			} else {
				this.x += xVelocity;
				this.y += yVelocity;
			}
		}
		
		
		this.draw = function(){
			AmericanSeason.context.beginPath(); 
			
			var trailEndX = this.trail[this.trail.length - 1][0]; 
			var trailEndY = this.trail[this.trail.length - 1][1];
			
			AmericanSeason.context.globalCompositeOperation = this.globalCompositeOperation;
			AmericanSeason.context.lineWidth = this.lineWidth;
			AmericanSeason.context.lineCap = this.lineCap;
			AmericanSeason.context.moveTo(trailEndX, trailEndY);
			AmericanSeason.context.lineTo(this.x, this.y);
			AmericanSeason.context.strokeStyle = `hsl(${AmericanSeason.hue}, 100%, ${this.brightness}%)`;
			AmericanSeason.context.stroke(); // Draw stroke.
		}
	}
	
	AmericanSeason.Star = function(x, y, itr, type, override){
		this.x = x;
		this.y = y;
		this.type = type;
		this.age = 0;
		this.angle		= AmericanSeason.randBetween(0, Math.PI * 2);
		this.hue		= AmericanSeason.randBetween(AmericanSeason.hue - AmericanSeason.config.STAR_HUE_VARIANCE, AmericanSeason.hue + AmericanSeason.config.STAR_HUE_VARIANCE);
		this.brightness	= AmericanSeason.randBetween(AmericanSeason.config.STAR_BRIGHTNESS_MIN, AmericanSeason.config.STAR_BRIGHTNESS_MAX);
		this.friction	= AmericanSeason.config.STAR_FRICTION;
		this.gravity	= AmericanSeason.config.STAR_GRAVITY;
		this.decay		= AmericanSeason.randBetween(AmericanSeason.config.STAR_DECAY_MIN, AmericanSeason.config.STAR_DECAY_MAX);
		this.speed		= AmericanSeason.randBetween(AmericanSeason.config.STAR_SPEED_MIN, AmericanSeason.config.STAR_SPEED_MAX);
		this.transparency = AmericanSeason.config.STAR_TRANSPARENCY;
		this.trailLength = AmericanSeason.config.STAR_TRAIL_LENGTH;
		this.lineWidth	= AmericanSeason.config.STROKE_WIDTH;
		this.lineCap 	= "round";
		this.globalCompositeOperation = 'lighter';
		// Chrysanthemum type is default
		
		if(type == 'ring'){
			this.angle = Math.PI * 2 * itr / 100 * 4;
			this.speed = AmericanSeason.config.STAR_SPEED_MAX;
			this.trailLength = Math.ceil(AmericanSeason.config.STAR_TRAIL_LENGTH / 5);
			this.lineWidth = AmericanSeason.config.STROKE_WIDTH * 5;
		}
		else if(type == 'peony'){
			this.angle = Math.PI * 2 * itr / 100 * 2;
			this.speed = AmericanSeason.config.STAR_SPEED_MAX;
			this.transparency = AmericanSeason.config.STAR_TRANSPARENCY / 2;
			this.brightness = AmericanSeason.config.STAR_BRIGHTNESS_MAX;
			this.lineWidth = AmericanSeason.config.STROKE_WIDTH * 2;
		}
		else if(type == 'palm'){
			this.lineWidth = AmericanSeason.config.STROKE_WIDTH * 10;
			this.speed = AmericanSeason.randBetween(Math.max(AmericanSeason.config.STAR_SPEED_MIN, AmericanSeason.config.STAR_SPEED_MAX / 2), AmericanSeason.config.STAR_SPEED_MAX);
			this.trailLength *= 1.5;
			this.globalCompositeOperation = 'source-over';
		}
		else if(type == 'bees'){
			this.lineWidth = AmericanSeason.config.STROKE_WIDTH * 2;
			this.trailLength = Math.ceil(AmericanSeason.config.STAR_TRAIL_LENGTH / 5);
		}
		else if(type == 'crossette'){
			this.lineWidth *= 2;
			this.speed = AmericanSeason.randBetween(AmericanSeason.config.STAR_SPEED_MIN + (AmericanSeason.config.STAR_SPEED_MIN + AmericanSeason.config.STAR_SPEED_MAX) / 2, AmericanSeason.config.STAR_SPEED_MAX);
		}
		else if(type == 'waterfall'){
			this.decay /= 3;
		}
		else if(type == 'pearl'){
			this.gravity *= -1;
			this.angle = AmericanSeason.randBetween(Math.PI, Math.PI * 2);
			this.lineWidth = AmericanSeason.config.STROKE_WIDTH * 10;
			this.decay /= 3;
		}
		else if(type == 'pistil'){
			this.angle = Math.PI * 2 * itr / 100 * 2;
			this.trailLength *= 2;
			if(itr % 2 == 0){
				this.speed = AmericanSeason.config.STAR_SPEED_MAX;
				this.transparency = AmericanSeason.config.STAR_TRANSPARENCY / 2;
				this.brightness = AmericanSeason.config.STAR_BRIGHTNESS_MAX;
				this.lineWidth = AmericanSeason.config.STROKE_WIDTH * 2;
			}else{
				this.speed = AmericanSeason.config.STAR_SPEED_MAX / 2;
				this.trailLength = Math.ceil(AmericanSeason.config.STAR_TRAIL_LENGTH / 5);
				this.lineWidth = AmericanSeason.config.STROKE_WIDTH * 5;
			}
		}
		
		for(var item in override){
			this[item] = override[item];
		}
		
		if(AmericanSeason.config.GLOBAL_COMPOSITE_OPERATION != 'default') this.globalCompositeOperation = AmericanSeason.config.GLOBAL_COMPOSITE_OPERATION;
		
		this.trail = [];
		for(var i = 0; i < this.trailLength; i++){
			this.trail.push([this.x, this.y]);
		}
		
		
		this.update = function(index) {
			this.age++;
			this.trail.pop();
			this.trail.unshift([this.x, this.y]);
			
			this.speed *= this.friction;
			
			if(this.type == 'bees' && this.age > (Game.fps / 2) && Math.random() < (5 / Game.fps)){
				this.age = 0;
				this.speed = AmericanSeason.randBetween(AmericanSeason.config.STAR_SPEED_MIN, AmericanSeason.config.STAR_SPEED_MAX);
				this.angle = AmericanSeason.randBetween(0, Math.PI * 2);
			}
			else if(this.type == 'crossette' && this.age > (Game.fps / 2) && Math.random() < 0.1){
				this.transparency = this.decay;
				AmericanSeason.stars.push(new AmericanSeason.Star(this.x, this.y, 0, 0, {angle: 0,				speed:AmericanSeason.config.STAR_SPEED_MAX / 3}));
				AmericanSeason.stars.push(new AmericanSeason.Star(this.x, this.y, 0, 0, {angle: Math.PI / 2,	speed:AmericanSeason.config.STAR_SPEED_MAX / 3}));
				AmericanSeason.stars.push(new AmericanSeason.Star(this.x, this.y, 0, 0, {angle: Math.PI,		speed:AmericanSeason.config.STAR_SPEED_MAX / 3}));
				AmericanSeason.stars.push(new AmericanSeason.Star(this.x, this.y, 0, 0, {angle: Math.PI * 3 / 2,speed:AmericanSeason.config.STAR_SPEED_MAX / 3}));
			}
			else if(this.type == 'waterfall' && this.age > (Game.fps / 2)){
				this.trail.unshift([this.x, this.y]);
			}
			
			this.x += Math.cos(this.angle) * this.speed;
			this.y += Math.sin(this.angle) * this.speed + this.gravity;
			
			this.transparency -= this.decay;
			if(this.transparency <= this.decay) {
				AmericanSeason.stars.splice(index, 1);
			}
		}
		
		
		this.draw = function() {
			AmericanSeason.context.beginPath(); 
			
			var trailEndX = this.trail[this.trail.length - 1][0];
			var trailEndY = this.trail[this.trail.length - 1][1];
			
			AmericanSeason.context.globalCompositeOperation = this.globalCompositeOperation;
			AmericanSeason.context.lineWidth = this.lineWidth;
			AmericanSeason.context.lineCap = this.lineCap;
			AmericanSeason.context.moveTo(trailEndX, trailEndY);
			AmericanSeason.context.lineTo(this.x, this.y);
			AmericanSeason.context.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.transparency})`;
			AmericanSeason.context.stroke();
		}
	}
	
	AmericanSeason.launchManualFirework = function() {
		if(AmericanSeason.ticksSinceFirework >= AmericanSeason.config.TICKS_PER_FIREWORK_MIN){
			if(Game.mouseDown && Game.mouseX < AmericanSeason.canvas.width){
				var startX = AmericanSeason.canvas.width / 2;
				var startY = AmericanSeason.canvas.height;
				
				var endX = Game.mouseX;
				var endY = Game.mouseY;
				
				AmericanSeason.fireworks.push(new AmericanSeason.Firework(startX, startY, endX, endY));
				AmericanSeason.ticksSinceFirework = 0;
			}
		}else{
			AmericanSeason.ticksSinceFirework++;
		}
	}
	
	AmericanSeason.Draw = function(){
		for(var i = AmericanSeason.fireworks.length - 1; i >= 0; --i) {
			AmericanSeason.fireworks[i].draw();
			AmericanSeason.fireworks[i].update(i);
		}
		
		for (var i = AmericanSeason.stars.length - 1; i >= 0; --i) {
			AmericanSeason.stars[i].draw();
			AmericanSeason.stars[i].update(i);
		}
		
		AmericanSeason.hue += AmericanSeason.config.HUE_STEP_INCREASE;
	}
	
	AmericanSeason.Logic = function(){
		if(Game.season == 'american' && AmericanSeason.config.SHOW_CANVAS){
			AmericanSeason.canvas.style.display = 'block';
			AmericanSeason.launchManualFirework();
			AmericanSeason.cleanCanvas();
			AmericanSeason.Draw();
		}else{
			AmericanSeason.context.clearRect(0, 0, AmericanSeason.canvas.width, AmericanSeason.canvas.height);
			AmericanSeason.canvas.style.display = 'none';
		}
		
	}
	
	
	//***********************************
	//    Helper functions
	//***********************************
	AmericanSeason.randBetween = function(min, max){
		// Get a random number within the specified range.
		return Math.random() * (max - min) + min;
	}
	 
	AmericanSeason.calculateDistance = function(aX, aY, bX, bY){
		// Calculate the distance between two points.
		let xDistance = aX - bX;
		let yDistance = aY - bY;
		return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
	}
	
	AmericanSeason.createParticles = function(x, y) {
		var types = ['chrysanthemum', 'chrysanthemum', 'chrysanthemum']; // Most common
		if(Game.Has('Ring burst')) types.push('ring');
		if(Game.Has('Peony burst')) types.push('peony');
		if(Game.Has('Palm burst')) types.push('palm');
		if(Game.Has('Bees burst')) types.push('bees');
		if(Game.Has('Crossette burst')) types.push('crossette');
		if(Game.Has('Waterfall burst')) types.push('waterfall');
		if(Game.Has('Pearl burst')) types.push('pearl');
		if(Game.Has('Pistil burst')) types.push('pistil');
		
		var type = choose(types);
		
		var count = AmericanSeason.config.STAR_COUNT;
		if(type == 'ring') count /= 4;
		if(type == 'peony') count /= 2;
		if(type == 'palm') count /= 10;
		if(type == 'bees') count /= 2;
		if(type == 'crossette') count /= 7;
		if(type == 'waterfall') count /= 2;
		if(type == 'pearl') count /= 20;
		if(type == 'pistil') count /= 2;
		
		for(var i = 0; i < count; i++){
			AmericanSeason.stars.push(new AmericanSeason.Star(x, y, i, type));
		}
	}
	
	AmericanSeason.cleanCanvas = function(){
		AmericanSeason.context.globalCompositeOperation = 'destination-out';
		AmericanSeason.context.fillStyle = `rgba(0, 0, 0, ${AmericanSeason.config.CANVAS_CLEANUP_ALPHA})`;
		AmericanSeason.context.fillRect(0, 0, AmericanSeason.canvas.width, AmericanSeason.canvas.height);
	}
	
	AmericanSeason.GetHowManyFireworkDrops = function(){
		var num = 0;
		for(var i in AmericanSeason.upgrades) if(Game.Has(AmericanSeason.upgrades[i])) num++;
		return num;
	}
	
	AmericanSeason.GetModifiedCPS = function(currentCpS){
		var mult = 1;
		for(var i in AmericanSeason.fireworkTypes) if(Game.Has(AmericanSeason.fireworkTypes[i])) mult *= 1.01;
		return currentCpS * mult;
	}
	
	
	//***********************************
	//    Start the mod
	//***********************************
	if(CCSE.ConfirmGameVersion(AmericanSeason.name, AmericanSeason.version, AmericanSeason.GameVersion)) Game.registerMod(AmericanSeason.name, AmericanSeason); // AmericanSeason.init();
}

if(!AmericanSeason.isLoaded){
	if(CCSE && CCSE.isLoaded){
		AmericanSeason.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(AmericanSeason.launch);
	}
}