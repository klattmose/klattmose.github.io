Game.Win('Third-party');
if (FortuneCookie === undefined) {
	var FortuneCookie = {};
	FortuneCookie.config = {};
	FortuneCookie.config.spellForecastLength = 10;
	FortuneCookie.ConfigPrefix = "FortuneCookie";
	
	FortuneCookie.saveConfig = function(config){
		localStorage.setItem(FortuneCookie.ConfigPrefix, JSON.stringify(config));
	}

	FortuneCookie.loadConfig = function(){
		if (localStorage.getItem(FortuneCookie.ConfigPrefix) != null) {
			FortuneCookie.config = JSON.parse(localStorage.getItem(FortuneCookie.ConfigPrefix));
		}
	}
	
	FortuneCookie.loadConfig();
	FortuneCookie.memorySpellsCast = Game.Objects["Wizard tower"].minigame.spellsCast;
	FortuneCookie.memorySpellTotal = Game.Objects["Wizard tower"].minigame.spellsCastTotal;
	FortuneCookie.memoryMagic = Game.Objects["Wizard tower"].minigame.magic;
	
	FortuneCookie.oldUpdateMenu = Game.UpdateMenu;
	Game.UpdateMenu = function(){
		FortuneCookie.oldUpdateMenu();
		if(Game.onMenu === 'prefs') {
			var str = '<div class="title">Fortune Cookie</div>' +
					  '<div class="listing">'+
					  Game.WriteSlider('spellForecastSlider','Forecast Length','[$]',function(){return FortuneCookie.config.spellForecastLength;},"FortuneCookie.setForecastLength((Math.round(l('spellForecastSlider').value)));l('spellForecastSliderRightText').innerHTML=FortuneCookie.config.spellForecastLength;")+'<br>'+
					  '</div>';
			
			var div = document.createElement('div');
			div.innerHTML = str;
			var menu = document.getElementById('menu');
			if(menu) {
				menu = menu.getElementsByClassName('subsection')[0];
				if(menu) {
					var padding = menu.getElementsByTagName('div');
					padding = padding[padding.length - 1];
					if(padding) {
						menu.insertBefore(div, padding);
					} else {
						menu.appendChild(div);
					}
				}
			}
		}
	}
	
	var cmActive = (typeof CM)!="undefined";
	eval((cmActive ? ("CM.Backup.GrimoireLaunchMod = " + CM.Backup.GrimoireLaunchMod.toString()) : ("Game.ObjectsById[7].minigame.launch = " + Game.ObjectsById[7].minigame.launch.toString()))
		.replace(/('<\/div><\/div>.*)/, `'<div style="height:8px;"></div>' + 
				FortuneCookie.spellForecast(me) + 
				$1`
		)
	);
	Game.ObjectsById[7].minigame.launch();
	
	Game.Objects["Wizard tower"].minigame.spellsCast = FortuneCookie.memorySpellsCast;
	Game.Objects["Wizard tower"].minigame.spellsCastTotal = FortuneCookie.memorySpellTotal;
	Game.Objects["Wizard tower"].minigame.magic = FortuneCookie.memoryMagic;
	
	
	for(var i = 0; i < 3; i++){
		var me;
		if(i == 0) me = Game.Upgrades["Shimmering veil"];
		if(i == 1) me = Game.Upgrades["Shimmering veil [off]"];
		if(i == 2) me = Game.Upgrades["Shimmering veil [on]"];
		
		if(typeof me.descFunc != 'undefined') me.oldDescFunc = me.descFunc;
		me.descFunc = function(){
			var str;
			if(this.oldDescFunc === undefined) str = this.desc;
			else str = this.oldDescFunc();
			
			
			if (Game.Has('Reinforced membrane')){
				var durable = FortuneCookie.forecastMembrane('click', 0);
				var golddurable = FortuneCookie.forecastMembrane('shimmer', 0);
				
				str += '<br/><br/>';
				var durCount = FortuneCookie.countMembraneDurability('click');
				var golddurCount = FortuneCookie.countMembraneDurability('shimmer');
				
				if(durable)
					str += '<span class="green">Reinforced against cookie clicks (for ' + (durCount==11?'>10':durCount) + ' click' + (durCount==1?'':'s') + ')</span><br/>';
				else
					str += '<span class="red">Unreinforced against cookie clicks (for ' + (durCount==11?'>10':durCount) + ' click' + (durCount==1?'':'s') + ')</span><br/>';
				
				if(golddurable)
					str += '<span class="green">Reinforced against golden cookie clicks (for ' + (golddurCount==11?'>10':golddurCount) + ' click' + (golddurCount==1?'':'s') + ')</span><br/>';
				else
					str += '<span class="red">Unreinforced against golden cookie clicks (for ' + (golddurCount==11?'>10':golddurCount) + ' click' + (golddurCount==1?'':'s') + ')</span><br/>';
			}
			return str;
		}
	}
	
	
	if (Game.prefs.popups) Game.Popup('Fortune Cookie loaded!');
	else Game.Notify('Fortune Cookie loaded!', '', '', 1, 1);
};



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
	
	for(i = 1; i < 11; i++){
		if(FortuneCookie.forecastMembrane(context, i) != initialSuccess) return i;
	}
	return 11;
}

FortuneCookie.setForecastLength = function(length){
	FortuneCookie.config.spellForecastLength = length;
	FortuneCookie.saveConfig(FortuneCookie.config);
}

FortuneCookie.FateChecker = function(spellCount, idx, backfire){
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
		
		FTHOFcookie = choose(choices);
		res = '<span class="red">' + FTHOFcookie + '</span><br/>';
		
	}
	
	if(FTHOFcookie == 'Free Sugar Lump') res = '<span style="color:#DAA520;">' + FTHOFcookie + '</span><br/>';
	return '<td>' + res + '</td>';
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

FortuneCookie.spellForecast=function(spell){
	if(FortuneCookie.config.spellForecastLength == 0) return '';
	var spellOutcome = '<div width="100%"><b>Forecast:</b><br/>';
	var M = Game.Objects["Wizard tower"].minigame;
	var backfire = M.getFailChance(spell);
	var spellsCast = Game.Objects["Wizard tower"].minigame.spellsCastTotal;
	var target = spellsCast + FortuneCookie.config.spellForecastLength;
	var idx = ((Game.season == "valentines" || Game.season == "easter") ? 1 : 0) + ((Game.chimeType == 1 && Game.ascensionMode != 1) ? 1 : 0);
	
	switch(spell.name){
		case "Force the Hand of Fate":
			
			spellOutcome += '<table width="100%"><tr>';
			for(var i = 0; i < 3; i++)
				spellOutcome += '<td width="33%">' + ((i == idx) ? 'Active' : '') + '</td>';
			spellOutcome += '</tr><br/>';
			
			while(spellsCast < target){
				spellOutcome += '<tr>';
				for(var i = 0; i < 3; i++)
					spellOutcome += FortuneCookie.FateChecker(spellsCast, i, backfire);
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
					Math.seedrandom(Game.seed + '/' + (spellsCast + 1));
					if(Math.random() < (1 - Math.max(gfdBackfire, 0.5))){
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
			
		case "Conjure Baked Goods":
		case "Stretch Time":
		case "Haggler's Charm":
		case "Summon Crafty Pixies":
		case "Resurrect Abomination":
		case "Diminish Ineptitude":
			while(spellsCast < target){
				Math.seedrandom(Game.seed + '/' + spellsCast);
				if(Math.random() < (1 - backfire))
					spellOutcome += '<span class="green">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Success</span><br/>';
				else
					spellOutcome += '<span class="red">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Backfire</span><br/>';
				
				spellsCast += 1;
				Math.seedrandom();
			}
			break;
			
		default:
			spellOutcome = "";
	}
	return spellOutcome;
}