Game.Win('Third-party');
if(FortuneCookie === undefined) var FortuneCookie = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (1 ? 'Beta/' : '') + 'CCSE.js');
FortuneCookie.name = 'Fortune Cookie';
FortuneCookie.version = '2.16';
FortuneCookie.GameVersion = '2.019';

FortuneCookie.launch = function(){
	FortuneCookie.init = function(){
		FortuneCookie.isLoaded = 1;
		FortuneCookie.Backup = {};
		FortuneCookie.config = {};
		
		FortuneCookie.loadConfig();
		CCSE.customLoad.push(FortuneCookie.loadConfig);
		CCSE.customSave.push(FortuneCookie.saveConfig);
		
		FortuneCookie.ReplaceNativeGrimoire();
		FortuneCookie.ReplaceGameMenu();
		FortuneCookie.initMembraneForecast();
		
		
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
	FortuneCookie.saveConfig = function(config){
		CCSE.save.OtherMods.FortuneCookie = FortuneCookie.config;
	}

	FortuneCookie.loadConfig = function(){
		if(CCSE.save.OtherMods.FortuneCookie) FortuneCookie.config = CCSE.save.OtherMods.FortuneCookie; else FortuneCookie.config = {};
		
		// Default values if they're missing
		if(FortuneCookie.config.spellForecastLength === undefined) FortuneCookie.config.spellForecastLength = 10;
		if(FortuneCookie.config.simGCs === undefined) FortuneCookie.config.simGCs = 0;
	}

	FortuneCookie.setForecastLength = function(length){
		FortuneCookie.config.spellForecastLength = length;
	}
	
	FortuneCookie.setSimGCs = function(sim){
		FortuneCookie.config.simGCs = sim;
	}

	FortuneCookie.getSimGCs = function(){
		return (FortuneCookie.config.simGCs ? FortuneCookie.config.simGCs : 0);
	}
	

	//***********************************
	//    Replacement
	//***********************************
	FortuneCookie.ReplaceGameMenu = function(){
		Game.customOptionsMenu.push(function(){
			WriteSlider = function(slider, leftText, rightText, startValueFunction, callback, min, max, step){
				if (!callback) callback = '';
				if (!min) min = 0;
				if (!max) max = 100;
				if (!step) step = 1;
				return '<div class="sliderBox"><div style="float:left;">' + leftText + '</div><div style="float:right;" id="' + slider + 'RightText">' + rightText.replace('[$]', startValueFunction()) + '</div><input class="slider" style="clear:both;" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + startValueFunction() + '" onchange="' + callback + '" oninput="'+callback+'" onmouseup="PlaySound(\'snd/tick.mp3\');" id="' + slider + '"/></div>';
			}
			
			var writeHeader = function(text) {
				var div = document.createElement('div');
				div.className = 'listing';
				div.style.padding = '5px 16px';
				div.style.opacity = '0.7';
				div.style.fontSize = '17px';
				div.style.fontFamily = '\"Kavoon\", Georgia, serif';
				div.textContent = text;
				return div.outerHTML;
			}
			
			CCSE.AppendCollapsibleOptionsMenu(FortuneCookie.name,
				'<div class="listing">' +
					WriteSlider('spellForecastSlider', 'Forecast Length', '[$]', function(){return FortuneCookie.config.spellForecastLength;}, "FortuneCookie.setForecastLength((Math.round(l('spellForecastSlider').value))); l('spellForecastSliderRightText').innerHTML = FortuneCookie.config.spellForecastLength;", 0, 100, 1) + '<br>'+
				'</div>' + 
				writeHeader('Force the Hand of Fate') + 
				'<div class="listing">This spell\'s outcome changes based on the season, if the Golden cookie sound selector is on, how many Golden Cookies are already on screen, and if a Dragonflight buff is currently active.</div>' + 
				'<div class="listing">Column 1 : Golden cookie sound selector is Off <b>AND</b> the season is neither Easter nor Valentine\'s.</div>' + 
				'<div class="listing">Column 2 : Golden cookie sound selector is On <b>OR</b> the season is either Easter or Valentine\'s.</div>' + 
				'<div class="listing">Column 3 : Golden cookie sound selector is On <b>AND</b> the season is either Easter or Valentine\'s.</div>' +
				'<div class="listing">You can use this slider to forecast the outcome with more Golden Cookies on screen.</div>' +
				'<div class="listing">' +
					WriteSlider('simGCsSlider', 'Simulate GCs', '[$]', FortuneCookie.getSimGCs, "FortuneCookie.setSimGCs(Math.round(l('simGCsSlider').value)); l('simGCsSliderRightText').innerHTML = FortuneCookie.config.simGCs;", 0, 10, 1) + '<br>'+
				'</div>'
			);
		});
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(FortuneCookie.name, FortuneCookie.version);
		});
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
		if (context=='shimmer') Math.seedrandom(Game.seed + '/' + (Game.goldenClicks + offset));
		else if (context=='click') Math.seedrandom(Game.seed + '/' + (Game.cookieClicks + offset));
		
		if (Math.random() < 0.1){
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
		
		if(FTHOFcookie == 'Free Sugar Lump') res = '<span style="color:#DAA520;">' + FTHOFcookie + '</span><br/>';
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
		var idx = ((Game.season == "valentines" || Game.season == "easter") ? 1 : 0) + ((Game.chimeType == 1 && Game.ascensionMode != 1) ? 1 : 0);
		
		switch(spell.name){
			case "Force the Hand of Fate":
				backfire += 0.15 * FortuneCookie.getSimGCs();
			
				spellOutcome = spellOutcome.replace('<br/>', '<span style="color:yellow;">This spell is a bit complicated. See the Options menu for an explanation.</span><br/>') + 
					'<table width="100%"><tr>';
				for(var i = 0; i < 3; i++)
					spellOutcome += '<td width="33%">' + ((i == idx) ? 'Active' : '') + '</td>';
				spellOutcome += '</tr><br/>';
				
				while(spellsCast < target){
					spellOutcome += '<tr>';
					for(var i = 0; i < 3; i++)
						spellOutcome += FortuneCookie.FateChecker(spellsCast, i, backfire, false); // Change false to idx == i for an identifier
					spellOutcome += '</tr>';
					
					spellsCast += 1;
					Math.seedrandom();
				}
				spellOutcome += '</table></div>';
				break;
			
			case "Spontaneous Edifice":
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
							spellOutcome += '<span class="green">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + building.name + '</span><br/>';
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
							spellOutcome += '<span class="red">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + building.name + '</span><br/>';
						}
					}
					spellsCast += 1;
					Math.seedrandom();
				}
				break;
				
			case "Gambler's Fever Dream":
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
							if(gfdSpell.name == "Force the Hand of Fate") spellOutcome += ' (' + FortuneCookie.gamblerFateChecker(spellsCast + 1, idx, true) + ')';
							if(gfdSpell.name == "Spontaneous Edifice") spellOutcome += ' (' + FortuneCookie.gamblerEdificeChecker(spellsCast + 1, true) + ')';
							spellOutcome += '</span><br/>';
						}else{
							spellOutcome += '<span class="red">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + gfdSpell.name;
							if(gfdSpell.name == "Force the Hand of Fate") spellOutcome += ' (' + FortuneCookie.gamblerFateChecker(spellsCast + 1, idx, false) + ')';
							if(gfdSpell.name == "Spontaneous Edifice") spellOutcome += ' (' + FortuneCookie.gamblerEdificeChecker(spellsCast + 1, false) + ')';
							spellOutcome += '</span><br/>';
						}
					}
					
					spellsCast+=1;
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
	
	if(CCSE.ConfirmGameVersion(FortuneCookie.name, FortuneCookie.version, FortuneCookie.GameVersion)) FortuneCookie.init();
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