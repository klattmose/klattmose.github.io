if(FortuneCookie === undefined) var FortuneCookie = {};
FortuneCookie.name = 'Fortune Cookie';
FortuneCookie.version = '2.10';
FortuneCookie.GameVersion = '2.048';

FortuneCookie.launch = function(){
	FortuneCookie.init = function(){
		FortuneCookie.isLoaded = 1;
		FortuneCookie.Backup = {};
		FortuneCookie.config = {};
		
		FortuneCookie.config = FortuneCookie.defaultConfig();
		if(CCSE.config.OtherMods.FortuneCookie && !Game.modSaveData[FortuneCookie.name]) Game.modSaveData[FortuneCookie.name] = JSON.stringify(CCSE.config.OtherMods.FortuneCookie);
		
		FortuneCookie.ReplaceNativeGrimoire();
		FortuneCookie.initMembraneForecast();
		FortuneCookie.initDragonDropForecast();
		
		
		Game.customOptionsMenu.push(function(){
			CCSE.AppendCollapsibleOptionsMenu(FortuneCookie.name, FortuneCookie.getMenuString());
		});
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(FortuneCookie.name, FortuneCookie.version);
		});
		
		//***********************************
		//    Post-Load Hooks 
		//    To support other mods interfacing with this one
		//***********************************
		if(FortuneCookie.postloadHooks) {
			for(var i = 0; i < FortuneCookie.postloadHooks.length; ++i) {
				(FortuneCookie.postloadHooks[i])();
			}
		}
		
		if (Game.prefs.popups) Game.Popup('Fortune Cookie loaded!');
		else Game.Notify('Fortune Cookie loaded!', '', '', 1, 1);
	}


	//***********************************
	//    Configuration
	//***********************************
	FortuneCookie.save = function(){
		return JSON.stringify(FortuneCookie.config);
	}

	FortuneCookie.load = function(str){
		var config = JSON.parse(str);
		for(var pref in config){
			FortuneCookie.config[pref] = config[pref];
		}
	}
	
	FortuneCookie.defaultConfig = function(){
		return {
			spellForecastLength : 10,
			simGCs : 0,
			colorOverride: {
				'Building Special'	: "#FF00FF",
				'Click Frenzy'		: "#4BB8F0",
				'Elder Frenzy'		: "#E1C699",
				'Free Sugar Lump'	: "#DAA560"
			},
			forecastDragonDrop : true
		}
	}
	
	FortuneCookie.UpdatePref = function(prefName, value){
		FortuneCookie.config[prefName] = value;
	}
	
	FortuneCookie.SetOverrideColor = function(effect, color){
		FortuneCookie.config.colorOverride[effect] = color;
		Game.UpdateMenu();
	}

	FortuneCookie.getSimGCs = function(){
		// default to 0 if some BS causes this to be undefined
		return (FortuneCookie.config.simGCs ? FortuneCookie.config.simGCs : 0);
	}
	
	FortuneCookie.AddColorOverride = function(){
		var str = '<h3>New color override</h3><div class="block">';
		str += '<table style="width:80%;">';
		str += '<tr><td style="text-align:right; width:45%;">Effect:</td><td style="width:5%;"></td><td style="text-align:left; width:50%;"><input id="effectEditor" class="option" type="text" value="" style="width: 65px;" /></td></tr>';
		str += '<tr><td style="text-align:right;">Color:</td><td></td><td style="text-align:left;"><input id="colorEditor" class="option" type="text" value="#FFFFFF" style="width: 65px;" /></td></tr>';
		str += '</table></div>';
		
		Game.Prompt(str, [['Save', 'FortuneCookie.config.colorOverride[l("effectEditor").value] = l("colorEditor").value; Game.ClosePrompt(); Game.UpdateMenu();'], 
						  ['Nevermind', 'Game.ClosePrompt();']], 0);
	}
	

	//***********************************
	//    Replacement
	//***********************************
	FortuneCookie.getMenuString = function(){
		let m = CCSE.MenuHelper;
		
		var str = '<div class="listing">' +
					m.Slider('spellForecastSlider', 'Forecast Length', '[$]', function(){return FortuneCookie.config.spellForecastLength;}, "FortuneCookie.UpdatePref('spellForecastLength', Math.round(l('spellForecastSlider').value)); l('spellForecastSliderRightText').innerHTML = FortuneCookie.config.spellForecastLength;", 0, 100, 1) + '<br>' +
				'</div>';
		
		str += m.Header('Force the Hand of Fate') + 
				'<div class="listing">This spell\'s outcome changes based on the season, how many Golden Cookies are already on screen, and if a Dragonflight buff is currently active.</div>' + 
				'<div class="listing">Column 1 : The season is <b>neither</b> Easter nor Valentine\'s.</div>' + 
				'<div class="listing">Column 2 : The season is <b>either</b> Easter or Valentine\'s.</div>' + 
				'<div class="listing">You can use this slider to forecast the outcome with more Golden Cookies on screen.</div>' +
				'<div class="listing">' +
					m.Slider('simGCsSlider', 'Simulate GCs', '[$]', FortuneCookie.getSimGCs, "FortuneCookie.UpdatePref('simGCs', Math.round(l('simGCsSlider').value)); l('simGCsSliderRightText').innerHTML = FortuneCookie.config.simGCs;", 0, 10, 1) + '<br>'+
				'</div>';
		
		str += m.Header('Color Override') +
				'<div class="listing">Set the color coding of the Force the Hand of Fate outcomes.</div>' +
				'<div class="listing">Default is <span class="green">green for success</span>, and <span class="red">red for backfire</span>.</div>';
		str += '<div class="listing">' + m.ActionButton("FortuneCookie.AddColorOverride();",'Add') + '</div>';
		
		for(var color in FortuneCookie.config.colorOverride){
			var style = 'width:65px;' +
						'background-color:'  + FortuneCookie.config.colorOverride[color] + ';';
			
			str += '<div class="listing">' +
				m.ActionButton("delete FortuneCookie.config.colorOverride['" + color + "']; Game.UpdateMenu();",'Remove') +
				'<input id="FortuneCookieColorOverride' + color + '" class="option" style="' + style + '" value="' + FortuneCookie.config.colorOverride[color] + '" onChange="FortuneCookie.SetOverrideColor(\'' + color + '\', l(\'FortuneCookieColorOverride' + color + '\').value)">' +
				'<label>' + color + '</label>' +
				'</div>';
		}
		
		str += m.Header('Dragon Drop forecast') + 
				'<div class="listing">' + m.ToggleButton(FortuneCookie.config, 'forecastDragonDrop', 'forecastDragonDropButton', 'Tooltip ON', 'Tooltip OFF', "FortuneCookie.Toggle") + '<label>Show/Hide the tooltip that displays the available drops for petting the dragon.</label></div>';
		
		return str;
	}
	
	FortuneCookie.Toggle = function(prefName, button, on, off, invert){
		if(FortuneCookie.config[prefName]){
			l(button).innerHTML = off;
			FortuneCookie.config[prefName] = 0;
		}
		else{
			l(button).innerHTML = on;
			FortuneCookie.config[prefName] = 1;
		}
		l(button).className = 'smallFancyButton prefButton option' + ((FortuneCookie.config[prefName] ^ invert) ? '' : ' off');
		
		if(Game.specialTab=='dragon') Game.ToggleSpecialMenu(1);
	}

	FortuneCookie.ReplaceNativeGrimoire = function() {
		if(!Game.customMinigame['Wizard tower'].spellTooltip) Game.customMinigame['Wizard tower'].spellTooltip = [];
		Game.customMinigame['Wizard tower'].spellTooltip.push(function(id, str){
			return str.replace( '</div></div>', 
								'<div style="height:8px;"></div>' + 
								FortuneCookie.spellForecast(Game.Objects['Wizard tower'].minigame.spellsById[id]) + 
								'</div></div>');
		});
	}


	//***********************************
	//    Membrane Forecast
	//***********************************
	FortuneCookie.initMembraneForecast = function(){
		var descFunc = function(me, desc){
			var str = desc;
			
			if (Game.Has('Reinforced membrane') && FortuneCookie.config.spellForecastLength){
				var durable = FortuneCookie.forecastMembrane('click', 0);
				var golddurable = FortuneCookie.forecastMembrane('shimmer', 0);
				
				str += '<br/><br/>';
				var durCount = FortuneCookie.countMembraneDurability('click');
				var golddurCount = FortuneCookie.countMembraneDurability('shimmer');
				
				if(durable)
					str += '<span class="green">Reinforced against cookie clicks (for ' + (durCount==-1?('>'+FortuneCookie.config.spellForecastLength):durCount) + ' click' + (durCount==1?'':'s') + ')</span><br/>';
				else
					str += '<span class="red">Unreinforced against cookie clicks (for ' + (durCount==-1?('>'+FortuneCookie.config.spellForecastLength):durCount) + ' click' + (durCount==1?'':'s') + ')</span><br/>';
				
				if(golddurable)
					str += '<span class="green">Reinforced against golden cookie clicks (for ' + (golddurCount==-1?('>'+FortuneCookie.config.spellForecastLength):golddurCount) + ' click' + (golddurCount==1?'':'s') + ')</span><br/>';
				else
					str += '<span class="red">Unreinforced against golden cookie clicks (for ' + (golddurCount==-1?('>'+FortuneCookie.config.spellForecastLength):golddurCount) + ' click' + (golddurCount==1?'':'s') + ')</span><br/>';
			}
			return str;
		}
		
		Game.customUpgrades['Shimmering veil [off]'].descFunc.push(descFunc);
		Game.customUpgrades['Shimmering veil [on]'].descFunc.push(descFunc);
		
	}

	FortuneCookie.forecastMembrane = function(context, offset){
		if (context=='shimmer') Math.seedrandom(Game.seed + '/' + (Game.goldenClicks + Game.reindeerClicked + offset));
		else if (context=='click') Math.seedrandom(Game.seed + '/' + (Game.cookieClicks + offset));
		
		if (Math.random() < Game.getVeilDefense()){
			return true;
		} else {
			return false;
		}
	}

	FortuneCookie.countMembraneDurability = function(context){
		var i;
		var initialSuccess = FortuneCookie.forecastMembrane(context, 0);
		
		for(i = 1; i <= FortuneCookie.config.spellForecastLength; i++){
			if(FortuneCookie.forecastMembrane(context, i) != initialSuccess) return i;
		}
		return -1;
	}


	//***********************************
	//    Dragon drop forecast
	//***********************************
	
	FortuneCookie.initDragonDropForecast = function(){
		var descFunc = function(str){
			var temp = str;
			
			if(temp.search("cursor:pointer") > -1 && FortuneCookie.config.forecastDragonDrop){
				temp = temp.replace('></div>', ' ' + Game.getTooltip(
					'<div style="min-width:200px;text-align:center;"><h4>Dragon Drops</h4>' +
					'<div class="line"></div>' +
					FortuneCookie.forecastDragonDrop() +
					'</div>', 'bottom-right') + 
				' ></div>');
			}
			
			return temp;
		}
		
		Game.customToggleSpecialMenu.push(descFunc);
	}
	
	FortuneCookie.forecastDragonDrop = function(){
		var str = '<table>';
		
		Math.seedrandom(Game.seed + '/dragonTime');
		var drops = ['Dragon scale', 'Dragon claw', 'Dragon fang', 'Dragon teddy bear'];
		drops = shuffle(drops);
		Math.seedrandom();
		
		var j = Math.floor((new Date().getMinutes() / 60) * drops.length);
		for(var i = 0; i < drops.length; i++){
			str += '<tr><td>' + (j == i ? 'Current --&gt; ' : '') + '</td><td>' + drops[i] + '</td><td>' + (Game.Has(drops[i]) || Game.HasUnlocked(drops[i]) ? '✔' : '') + '</td></tr>'
		}
		
		str += '</table>';
		
		return str;
	}
	
	
	//***********************************
	//    Grimoire forecast
	//***********************************
	
	// customFateChecker functions are for people who add their own outcome to FtHoF
	if(!FortuneCookie.customFateCheckerWin) FortuneCookie.customFateCheckerWin = [];
	if(!FortuneCookie.customFateCheckerFail) FortuneCookie.customFateCheckerFail = [];
	FortuneCookie.FateChecker = function(spellCount, idx, backfire, active){
		var res = '';
		var FTHOFcookie = '';
		Math.seedrandom(Game.seed + '/' + spellCount);
		roll = Math.random();
		
		if(roll < (1 - backfire)){
			/* Random is called a few times in setting up the golden cookie */
			if (idx > 0) Math.random();
			if (idx > 1) Math.random();
			Math.random();
			Math.random();
			
			var choices = [];
			choices.push('Frenzy','Lucky');
			if (!Game.hasBuff('Dragonflight')) choices.push('Click Frenzy');
			if (Math.random() < 0.1) choices.push('Cookie Storm','Cookie Storm','Blab');
			if (Game.BuildingsOwned >= 10 && Math.random() < 0.25) choices.push('Building Special');
			if (Math.random() < 0.15) choices = ['Cookie Storm Drop'];
			if (Math.random() < 0.0001) choices.push('Free Sugar Lump');
			
			for(var i in FortuneCookie.customFateCheckerWin) FortuneCookie.customFateCheckerWin[i](spellCount, idx, choices);
			
			FTHOFcookie = choose(choices);
			res = '<span class="green">' + FTHOFcookie + '</span><br/>';
			
		} else {
			/* Random is called a few times in setting up the golden cookie */
			if (idx > 0) Math.random();
			if (idx > 1) Math.random();
			Math.random();
			Math.random();
			
			var choices = [];
			choices.push('Clot','Ruin');
			if (Math.random() < 0.1) choices.push('Cursed Finger','Elder Frenzy');
			if (Math.random() < 0.003) choices.push('Free Sugar Lump');
			if (Math.random() < 0.1) choices=['Blab'];
			
			for(var i in FortuneCookie.customFateCheckerFail) FortuneCookie.customFateCheckerFail[i](spellCount, idx, choices);
			
			FTHOFcookie = choose(choices);
			res = '<span class="red">' + FTHOFcookie + '</span><br/>';
			
		}
		
		if(FortuneCookie.config.colorOverride[FTHOFcookie] !== undefined) res = '<span style="color:' + FortuneCookie.config.colorOverride[FTHOFcookie] + ';">' + FTHOFcookie + '</span><br/>';
		return '<td' + (active ? ' style="border-left: 2px solid grey;"' : '') + '>' + res + '</td>';
	}
	
	FortuneCookie.gamblerFateChecker = function(spellCount, idx, forceTrue){
		var res = '';
		Math.seedrandom(Game.seed + '/' + spellCount);
		roll = Math.random();
		
		if(forceTrue){
			/* Random is called a few times in setting up the golden cookie */
			if (idx > 0) Math.random();
			if (idx > 1) Math.random();
			Math.random();
			Math.random();
			
			var choices = [];
			choices.push('Frenzy','Lucky');
			if (!Game.hasBuff('Dragonflight')) choices.push('Click Frenzy');
			if (Math.random() < 0.1) choices.push('Cookie Storm','Cookie Storm','Blab');
			if (Game.BuildingsOwned >= 10 && Math.random() < 0.25) choices.push('Building Special');
			if (Math.random() < 0.15) choices = ['Cookie Storm Drop'];
			if (Math.random() < 0.0001) choices.push('Free Sugar Lump');
			
			for(var i in FortuneCookie.customFateCheckerWin) FortuneCookie.customFateCheckerWin[i](spellCount, idx, choices);
			
			return choose(choices);
			
		} else {
			/* Random is called a few times in setting up the golden cookie */
			if (idx > 0) Math.random();
			if (idx > 1) Math.random();
			Math.random();
			Math.random();
			
			var choices = [];
			choices.push('Clot','Ruin');
			if (Math.random() < 0.1) choices.push('Cursed Finger','Elder Frenzy');
			if (Math.random() < 0.003) choices.push('Free Sugar Lump');
			if (Math.random() < 0.1) choices = ['Blab'];
			
			for(var i in FortuneCookie.customFateCheckerFail) FortuneCookie.customFateCheckerFail[i](spellCount, idx, choices);
			
			return choose(choices);
			
		}
	}

	FortuneCookie.gamblerEdificeChecker = function(spellCount, forceTrue){
		Math.seedrandom(Game.seed + '/' + spellCount);
		Math.random();
		if(forceTrue){
			var buildings = [];
			var max = 0;
			var n = 0;
			for (var i in Game.Objects)
			{
				if (Game.Objects[i].amount > max) max = Game.Objects[i].amount;
				if (Game.Objects[i].amount > 0) n++;
			}
			for (var i in Game.Objects){
				if ((Game.Objects[i].amount<max || n == 1) && Game.Objects[i].getPrice() <= Game.cookies * 2 && Game.Objects[i].amount < 400) 
					buildings.push(Game.Objects[i]);
			}
			
			if (buildings.length == 0){
				return "Nothing";
			}else{
				var building = choose(buildings);
				return building.name;
			}
		} else {
			if (Game.BuildingsOwned == 0){
				return "Nothing";
			} else {
				var buildings = [];
				for (var i in Game.Objects){
					if (Game.Objects[i].amount > 0) 
						buildings.push(Game.Objects[i]);
				}
				var building=choose(buildings);
				return building.name;
			}
		}
	}
	
	// customSpellForecast functions should return HTML to append to the spell tooltip.
	// Return spellForecast to have no effect
	if(!FortuneCookie.customSpellForecast) FortuneCookie.customSpellForecast = [];
	FortuneCookie.spellForecast=function(spell){
		if(FortuneCookie.config.spellForecastLength == 0) return '';
		var spellOutcome = '<div width="100%"><b>Forecast:</b><br/>';
		var M = Game.Objects["Wizard tower"].minigame;
		var backfire = M.getFailChance(spell);
		var spellsCast = M.spellsCastTotal;
		var target = spellsCast + FortuneCookie.config.spellForecastLength;
		var idx = ((Game.season == "valentines" || Game.season == "easter") ? 1 : 0); // + ((Game.chimeType == 1 && Game.ascensionMode != 1) ? 1 : 0);
		
		switch(spell.name){
			case loc("Force the Hand of Fate"):
				backfire += 0.15 * FortuneCookie.getSimGCs();
			
				spellOutcome = spellOutcome.replace('<br/>', '<span style="color:yellow;">This spell is a bit complicated. See the Options menu for an explanation.</span><br/>') + 
					'<table width="100%"><tr>';
				for(var i = 0; i < 2; i++)
					spellOutcome += '<td width="33%">' + ((i == idx) ? 'Active' : '') + '</td>';
				spellOutcome += '</tr><br/>';
				
				while(spellsCast < target){
					spellOutcome += '<tr>';
					for(var i = 0; i < 2; i++)
						spellOutcome += FortuneCookie.FateChecker(spellsCast, i, backfire, false); // Change false to idx == i for an identifier
					spellOutcome += '</tr>';
					
					spellsCast += 1;
					Math.seedrandom();
				}
				spellOutcome += '</table></div>';
				break;
			
			case loc("Spontaneous Edifice"):
				while(spellsCast < target){
					Math.seedrandom(Game.seed + '/' + spellsCast);
					if(Math.random() < (1 - backfire)){
						var buildings = [];
						var max = 0;
						var n = 0;
						for (var i in Game.Objects)
						{
							if (Game.Objects[i].amount > max) max = Game.Objects[i].amount;
							if (Game.Objects[i].amount > 0) n++;
						}
						for (var i in Game.Objects){
							if ((Game.Objects[i].amount < max || n == 1) && Game.Objects[i].getPrice() <= Game.cookies * 2 && Game.Objects[i].amount < 400) 
								buildings.push(Game.Objects[i]);
						}
						
						if (buildings.length == 0){
							spellOutcome += '<span class="white">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;No buildings to improve!</span><br/>';
						}else{
							var building = choose(buildings);
							spellOutcome += '<span class="green">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + loc(building.name) + '</span><br/>';
						}
					}else{
						if (Game.BuildingsOwned == 0){
							spellOutcome += '<span class="white">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Backfired, but no buildings to destroy!</span><br/>';
						}else{
							var buildings = [];
							for (var i in Game.Objects){
								if (Game.Objects[i].amount > 0) 
									buildings.push(Game.Objects[i]);
							}
							var building=choose(buildings);
							spellOutcome += '<span class="red">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + loc(building.name) + '</span><br/>';
						}
					}
					spellsCast += 1;
					Math.seedrandom();
				}
				break;
				
			case loc("Gambler's Fever Dream"):
				while(spellsCast < target){
					Math.seedrandom(Game.seed + '/' + spellsCast);
					
					var spells = [];
					var selfCost = M.getSpellCost(M.spells["gambler's fever dream"]);
					for (var i in M.spells){
						if (i != "gambler's fever dream" && (M.magic-selfCost) >= M.getSpellCost(M.spells[i]) * 0.5) 
							spells.push(M.spells[i]);
					}
					if (spells.length == 0){
						spellOutcome += '<span class="white">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;No eligible spells!</span><br/>';
					}else{
						var gfdSpell = choose(spells);
						var gfdBackfire = M.getFailChance(gfdSpell);
						
						if(FortuneCookie.detectKUGamblerPatch()) gfdBackfire *= 2;
						else gfdBackfire = Math.max(gfdBackfire, 0.5);
						
						Math.seedrandom(Game.seed + '/' + (spellsCast + 1));
						if(Math.random() < (1 - gfdBackfire)){
							spellOutcome += '<span class="green">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + gfdSpell.name;
							if(gfdSpell.name == loc("Force the Hand of Fate")) spellOutcome += ' (' + FortuneCookie.gamblerFateChecker(spellsCast + 1, idx, true) + ')';
							if(gfdSpell.name == loc("Spontaneous Edifice")) spellOutcome += ' (' + loc(FortuneCookie.gamblerEdificeChecker(spellsCast + 1, true)) + ')';
							spellOutcome += '</span><br/>';
						}else{
							spellOutcome += '<span class="red">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + gfdSpell.name;
							if(gfdSpell.name == loc("Force the Hand of Fate")) spellOutcome += ' (' + FortuneCookie.gamblerFateChecker(spellsCast + 1, idx, false) + ')';
							if(gfdSpell.name == loc("Spontaneous Edifice")) spellOutcome += ' (' + loc(FortuneCookie.gamblerEdificeChecker(spellsCast + 1, false)) + ')';
							spellOutcome += '</span><br/>';
						}
					}
					
					spellsCast+=1;
					Math.seedrandom();
				}
				break;
				
			case loc("Conjure Baked Goods"):
				while(spellsCast < target){
					Math.seedrandom(Game.seed + '/' + spellsCast);
					if(Math.random() < (1 - backfire)){
						var val = Math.max(7, Math.min(Game.cookies * 0.15, Game.cookiesPs * 60 * 30));
						spellOutcome += '<span class="green">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + Beautify(val) + ' cookie' + (val == 1 ? '' : 's') + '</span><br/>';
					}else{
						var val = Math.min(Game.cookies * 0.15, Game.cookiesPs * 60 * 15) + 13;
						val = Math.min(Game.cookies, val);
						spellOutcome += '<span class="red">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + Beautify(val) + ' cookie' + (val == 1 ? '' : 's') + '</span><br/>';
					}
					
					spellsCast += 1;
					Math.seedrandom();
				}
				break;
				
			default:
				while(spellsCast < target){
					Math.seedrandom(Game.seed + '/' + spellsCast);
					if(Math.random() < (1 - backfire))
						spellOutcome += '<span class="green">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Success</span><br/>';
					else
						spellOutcome += '<span class="red">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Backfire</span><br/>';
					
					spellsCast += 1;
					Math.seedrandom();
				}
		}
		
		for(var i in CCSE.customSpellForecast) spellOutcome = CCSE.customSpellForecast[i](spellOutcome, spell);
		return spellOutcome;
	}

	FortuneCookie.detectKUGamblerPatch = function(){
		if(typeof KlattmoseUtilities == 'undefined') return false;
		if(typeof KlattmoseUtilities.config == 'undefined') return false;
		if(typeof KlattmoseUtilities.config.patches == 'undefined') return false;
		
		return KlattmoseUtilities.config.patches.gamblersFeverDreamFix == 1;
	}
	
	if(CCSE.ConfirmGameVersion(FortuneCookie.name, FortuneCookie.version, FortuneCookie.GameVersion)) Game.registerMod(FortuneCookie.name, FortuneCookie); // FortuneCookie.init();
}


if(!FortuneCookie.isLoaded){
	if(CCSE && CCSE.isLoaded){
		FortuneCookie.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(FortuneCookie.launch);
	}
}