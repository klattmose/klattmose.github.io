if(AmericanSeason === undefined) var AmericanSeason = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (1 ? 'Beta/' : '') + 'CCSE.js');
AmericanSeason.name = 'American Season';
AmericanSeason.version = '0.7';
AmericanSeason.GameVersion = '2.019';

AmericanSeason.launch = function(){
	AmericanSeason.init = function(){
		AmericanSeason.iconsURL = 'https://klattmose.github.io/CookieClicker/img/customIcons.png';
		AmericanSeason.config = AmericanSeason.defaultConfig();
		AmericanSeason.loadConfig();
		
		
		AmericanSeason.createSeason();
		AmericanSeason.createUpgrades();
		AmericanSeason.createShimmer();
		AmericanSeason.createCanvas();
		AmericanSeason.initFireworks();
		
		
		Game.customLogic.push(AmericanSeason.Logic);
		CCSE.customLoad.push(AmericanSeason.loadConfig);
		CCSE.customSave.push(AmericanSeason.saveConfig);
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(AmericanSeason.name, AmericanSeason.version);
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
		
		var str = '<div class="listing"><a class="option" ' + Game.clickStr + '="AmericanSeason.config = AmericanSeason.defaultConfig(); PlaySound(\'snd/tick.mp3\'); Game.UpdateMenu();">Restore Default</a></div>';
		
		str += header('Projectiles');
		str += inputBoxListing('FIREWORK_ACCELERATION', 'Base firework acceleration', '1.0 causes fireworks to travel at a constant speed. Higher number increases rate firework accelerates over time');
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
		str += inputBoxListing('CANVAS_CLEANUP_ALPHA', 'Alpha level that canvas cleanup iteration removes existing trails', 'Lower value increases trail duration');
		str += inputBoxListing('HUE_STEP_INCREASE', 'Hue change per loop', 'Used to rotate through different firework colors');
		str += inputBoxListing('TICKS_PER_FIREWORK_MIN', 'Minimum number of ticks per manual firework launch');
		
		return str;
	}
	
	AmericanSeason.defaultConfig = function(){
		return {
			FIREWORK_ACCELERATION 	: 1.1,		// Base firework acceleration. // 1.0 causes fireworks to travel at a constant speed. // Higher number increases rate firework accelerates over time.
			FIREWORK_BRIGHTNESS_MIN : 50,		// Minimum firework brightness.
			FIREWORK_BRIGHTNESS_MAX : 70,		// Maximum firework brightness.
			FIREWORK_SPEED 			: 10,		// Base speed of fireworks.
			FIREWORK_TRAIL_LENGTH 	: 3,		// Base length of firework trails.
			
			STAR_BRIGHTNESS_MIN 	: 50,		// Minimum star brightness.
			STAR_BRIGHTNESS_MAX 	: 80,		// Maximum star brightness.
			STAR_COUNT 				: 100,		// Base star count per firework.
			STAR_DECAY_MIN 			: 0.015,	// Minimum star decay rate.
			STAR_DECAY_MAX 			: 0.03,		// Maximum star decay rate.
			STAR_FRICTION 			: 0.9,		// Base star friction. // Slows the speed of particles over time.
			STAR_GRAVITY 			: 1.4,		// Base star gravity. // How quickly particles move toward a downward trajectory.
			STAR_HUE_VARIANCE 		: 20,		// Variance in star coloration.
			STAR_TRANSPARENCY 		: 1,		// Base star transparency.
			STAR_SPEED_MIN 			: 2,		// Minimum star speed.
			STAR_SPEED_MAX 			: 20,		// Maximum star speed.
			STAR_TRAIL_LENGTH 		: 5,		// Base length of explosion star trails.
			
			CANVAS_CLEANUP_ALPHA 	: 0.15,		// Alpha level that canvas cleanup iteration removes existing trails. // Lower value increases trail duration.
			HUE_STEP_INCREASE 		: 1,		// Hue change per loop, used to rotate through different firework colors.
			
			TICKS_PER_FIREWORK_MIN 	: 5,		// Minimum number of ticks per manual firework launch.
		}
	}
	
	AmericanSeason.saveConfig = function(){
		CCSE.save.OtherMods.AmericanSeason = AmericanSeason.config;
	}
	
	AmericanSeason.loadConfig = function(){
		var config = CCSE.save.OtherMods.AmericanSeason;
		for(var pref in config){
			AmericanSeason.config[pref] = config[pref];
		}
	}
	
	AmericanSeason.UpdatePref = function(prefName, value){
		var val = parseFloat(value);
		if(!isNaN(val)) AmericanSeason.config[prefName] = val;
		Game.UpdateMenu();
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
	}
	
	AmericanSeason.createUpgrades = function(){
		/**
		Fireworks upgrades

		Types (Just cps increase):
			Brocade
			Chrysanthemum
			Crossette
			Coconut
			Palm
			Peony
			Pistil
			Ring
			Waterfall
			Wave
			Whirlwind
			Willow
			
			
			Only eight lines, can get rid of four firework types
			
			O say can you see, by the dawn\'s early light,
			What so proudly we hailed at the twilight's last gleaming,
			Whose broad stripes and bright stars through the perilous fight,
			O\'er the ramparts we watched, were so gallantly streaming?
			And the rockets\' red glare, the bombs bursting in air,
			Gave proof through the night that our flag was still there;
			O say does that star-spangled banner yet wave
			O\'er the land of the free and the home of the brave?
			

		Shimmer modifiers:
			Short fuse
			High explosive
			Crackle
			Multi break

		**/
		
		AmericanSeason.upgrades = [];
		AmericanSeason.fireworkTypes = [];
		AmericanSeason.shimmerModifiers = [];
		
		var last;
		var order = Game.Upgrades["Santa's dominion"].order + 1 / 1000;
		var upPrice  = 999999999999;
		var upPrice2 = 99999999999999;
		
		
		last = CCSE.NewUpgrade('Brocade burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q></q>', upPrice, [1, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		last = CCSE.NewUpgrade('Chrysanthemum burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q></q>', upPrice, [2, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		last = CCSE.NewUpgrade('Crossette burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q></q>', upPrice, [3, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		last = CCSE.NewUpgrade('Coconut burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q></q>', upPrice, [4, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		last = CCSE.NewUpgrade('Palm burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q></q>', upPrice, [5, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		last = CCSE.NewUpgrade('Peony burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q></q>', upPrice, [6, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		last = CCSE.NewUpgrade('Pistil burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q></q>', upPrice, [7, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		last = CCSE.NewUpgrade('Ring burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q></q>', upPrice, [8, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		last = CCSE.NewUpgrade('Waterfall burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q></q>', upPrice, [9, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		last = CCSE.NewUpgrade('Wave burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q></q>', upPrice, [10, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		last = CCSE.NewUpgrade('Whirlwind burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q></q>', upPrice, [11, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		last = CCSE.NewUpgrade('Willow burst', 'Cookie production multiplier <b>+1%</b>.<br>Cost scales with how many firework upgrades you own.<q></q>', upPrice, [12, 4, AmericanSeason.iconsURL]); AmericanSeason.fireworkTypes.push(last.name);
		
		last = CCSE.NewUpgrade('Short fuse', 'Fireworks appear <b>twice as frequently</b>.<br>Cost scales with how many firework upgrades you own.<q></q>', upPrice2, [1, 5, AmericanSeason.iconsURL]); AmericanSeason.shimmerModifiers.push(last.name);
		last = CCSE.NewUpgrade('Slow burn', 'Fireworks fly <b>half as fast</b>.<br>Cost scales with how many firework upgrades you own.<q></q>', upPrice2, [2, 5, AmericanSeason.iconsURL]); AmericanSeason.shimmerModifiers.push(last.name);
		last = CCSE.NewUpgrade('High explosive', 'Fireworks give <b>twice as much</b>.<br>Cost scales with how many firework upgrades you own.<q></q>', upPrice2, [3, 5, AmericanSeason.iconsURL]); AmericanSeason.shimmerModifiers.push(last.name);
		//last = CCSE.NewUpgrade('Crackle', 'Each time a firework breaks, it has a <b>10% chance</b> to give <b>25% extra cookies</b> and release a shower of crackling lights.<br>Cost scales with how many firework upgrades you own.<q></q>', upPrice2, [4, 5, AmericanSeason.iconsURL]); AmericanSeason.shimmerModifiers.push(last.name);
		//last = CCSE.NewUpgrade('Multi break', 'Each time a firework breaks, it as a <b>25% chance</b> to break again.<br>Cost scales with how many firework upgrades you own.<q></q>', upPrice2, [5, 5, AmericanSeason.iconsURL]); AmericanSeason.shimmerModifiers.push(last.name);
		
		
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
	}
	
	AmericanSeason.GetHowManyFireworkDrops = function(){
		var num = 0;
		for(var i in AmericanSeason.upgrades) if(Game.Has(AmericanSeason.upgrades[i])) num++;
		return num;
	}
	
	AmericanSeason.createShimmer = function(){
		var shimmerTypeName = 'rocket';
		
		var shimmer = {
				reset: function(){
				},
				initFunc: function(me){
					if(!this.spawned && Game.chimeType == 1 && Game.ascensionMode != 1) PlaySound('snd/jingle.mp3');
					
					me.x = Math.floor(Math.random() * Math.max(0, Game.bounds.right - Game.bounds.left - 256) + Game.bounds.left + 128) - 128;
					me.y = Game.bounds.bottom;
					me.l.style.width = '148px';
					me.l.style.height = '488px';
					me.l.style.backgroundImage = 'url("https://klattmose.github.io/CookieClicker/img/rocket.png")';
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
					me.l.style.transform = 'translate(' + me.x + 'px,' + (me.y + (Game.bounds.top - me.y - 488*2) * (1 - me.life / (Game.fps * me.dur))) + 'px) scale(' + (me.sizeMult * (1 + Math.sin(me.id * 0.53) * 0.1)) + ')';
					me.life--;
					if(me.life <= 0){
						this.missFunc(me);
						me.die();
					}
				},
				popFunc: function(me){
					//get achievs and stats
					if(me.spawnLead){
						Game.reindeerClicked++;
					}
					
					var val = Game.cookiesPs * 60;
					var moni = Math.max(25, val); //1 minute of cookie production, or 25 cookies - whichever is highest
					if(Game.Has('High explosive')) moni *= 2;
					Game.Earn(moni);
					
					var upgrade = '';
					var failRate = 0.8;
					//if(Game.HasAchiev('Let it snow')) failRate = 0.6;
					failRate *= 1 / Game.dropRateMult();
					//if(Game.Has('Starburst')) failRate *= 0.95;
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
					PlaySound('snd/jingleClick.mp3');
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
				getTimeMod: function(me,m){
					if(Game.Has('Short fuse')) m /= 2;
					// if(Game.Has('Starburst')) m *= 0.95;
					if(Game.hasGod){
						var godLvl = Game.hasGod('seasons');
						if(godLvl == 1) m *= 0.9;
						else if(godLvl == 2) m *= 0.95;
						else if(godLvl == 3) m *= 0.97;
					}
					// if (Game.Has('Reindeer season')) m = 0.01;
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
		canvas.height = canvas.parentNode.offsetHeight;
		
		AmericanSeason.canvas = canvas;
		AmericanSeason.context = canvas.getContext('2d');
		
		window.addEventListener('resize', function(event){
			canvas.width = canvas.parentNode.offsetWidth;
			canvas.height = canvas.parentNode.offsetHeight;
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
			
			AmericanSeason.context.moveTo(trailEndX, trailEndY);
			AmericanSeason.context.lineTo(this.x, this.y);
			AmericanSeason.context.strokeStyle = `hsl(${AmericanSeason.hue}, 100%, ${this.brightness}%)`;
			AmericanSeason.context.stroke(); // Draw stroke.
		}
	}
	
	AmericanSeason.Star = function(x, y){
		this.x = x;
		this.y = y;
		this.angle = AmericanSeason.randBetween(0, Math.PI * 2);
		this.friction = AmericanSeason.config.STAR_FRICTION;
		this.gravity = AmericanSeason.config.STAR_GRAVITY;
		
		// Set the hue to somewhat randomized number.
		// This gives the particles within a firework explosion an appealing variance.
		this.hue 		= AmericanSeason.randBetween(AmericanSeason.hue - AmericanSeason.config.STAR_HUE_VARIANCE, AmericanSeason.hue + AmericanSeason.config.STAR_HUE_VARIANCE);
		this.brightness = AmericanSeason.randBetween(AmericanSeason.config.STAR_BRIGHTNESS_MIN, AmericanSeason.config.STAR_BRIGHTNESS_MAX);
		this.decay 		= AmericanSeason.randBetween(AmericanSeason.config.STAR_DECAY_MIN, AmericanSeason.config.STAR_DECAY_MAX); 
		this.speed 		= AmericanSeason.randBetween(AmericanSeason.config.STAR_SPEED_MIN, AmericanSeason.config.STAR_SPEED_MAX);
		
		this.trail = [];
		this.trailLength = AmericanSeason.config.STAR_TRAIL_LENGTH;
		// While the trail length remains, add current point to trail list.
		while(this.trailLength--) {
			this.trail.push([this.x, this.y]);
		}
		this.transparency = AmericanSeason.config.STAR_TRANSPARENCY;
		
		
		this.update = function(index) {
			this.trail.pop();
			this.trail.unshift([this.x, this.y]);
			
			this.speed *= this.friction;
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
	
	AmericanSeason.draw = function(){
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
		if(Game.season == 'american'){
			AmericanSeason.launchManualFirework();
			AmericanSeason.cleanCanvas();
			AmericanSeason.draw();
		}else{
			AmericanSeason.context.clearRect(0, 0, AmericanSeason.canvas.width, AmericanSeason.canvas.height);
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
		for(var i = 0; i < AmericanSeason.config.STAR_COUNT; i++){
			AmericanSeason.stars.push(new AmericanSeason.Star(x, y));
		}
	}
	
	AmericanSeason.cleanCanvas = function() {
		AmericanSeason.context.globalCompositeOperation = 'destination-out';
		AmericanSeason.context.fillStyle = `rgba(0, 0, 0, ${AmericanSeason.config.CANVAS_CLEANUP_ALPHA})`;
		AmericanSeason.context.fillRect(0, 0, AmericanSeason.canvas.width, AmericanSeason.canvas.height);
		AmericanSeason.context.globalCompositeOperation = 'lighter';
	}
	
	
	if(CCSE.ConfirmGameVersion(AmericanSeason.name, AmericanSeason.version, AmericanSeason.GameVersion)) AmericanSeason.init();
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