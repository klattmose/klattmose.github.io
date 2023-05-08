if(DecideDestiny === undefined) var DecideDestiny = {};
DecideDestiny.name = 'Decide Your Destiny';
DecideDestiny.version = '1.3';
DecideDestiny.GameVersion = '2.052';


//***********************************
//    API calls
//***********************************

DecideDestiny.init = function(){
	DecideDestiny.InjectIntoGoldenCookie();
	DecideDestiny.CreateUpgrades();
	DecideDestiny.CreateAchievements();
	
	DecideDestiny.reset();
	
	Game.customStatsMenu.push(function(){
		CCSE.AppendStatsVersionNumber(DecideDestiny.name, DecideDestiny.version);
		if(DecideDestiny.timesDecided) CCSE.AppendStatsSpecial('<div class="listing"><b>Times decided destiny :</b> ' + DecideDestiny.timesDecided + '</div>');
	});
	
	Game.registerHook('reset', DecideDestiny.reset);
	Game.registerHook('check', DecideDestiny.check);
	
	if (Game.prefs.popups) Game.Popup(DecideDestiny.name + ' loaded!');
	else Game.Notify(DecideDestiny.name + ' loaded!', '', '', 1, 1);
	DecideDestiny.isLoaded = 1;
}

DecideDestiny.save = function(){
	let str = DecideDestiny.version;
	str += ';' + DecideDestiny.decidedDestiny;
	str += ',' + DecideDestiny.timesDecided;
	
	return str;
}

DecideDestiny.load = function(str){
	var spl = str.split(';');
	
	if(spl.length == 1){ // Old save format
		spl = str.split(',');
		DecideDestiny.decidedDestiny = parseInt(spl[0]||0);
		DecideDestiny.timesDecided = parseInt(spl[1]||0);
		
		if(DecideDestiny.decidedDestiny >= DecideDestiny.AllDestinies.length) DecideDestiny.decidedDestiny = 0;
		DecideDestiny.decidedDestiny = DecideDestiny.AllDestinies[DecideDestiny.decidedDestiny].name;
	} else {
		str = spl;
		let saveVersion = parseFloat(str[0]||0);
		
		spl = str[1].split(',');
		DecideDestiny.decidedDestiny = (spl[0] ? spl[0] : DecideDestiny.AllDestinies[0].name);
		DecideDestiny.timesDecided = parseInt(spl[1]||0);
	}
	
	Game.Upgrades["Destiny decider"].priceLumps = DecideDestiny.calcCost();
}

DecideDestiny.reset = function(hard){
	if(hard) DecideDestiny.Undecide();
	DecideDestiny.timesDecided = 0;
	
	Game.Upgrades["Destiny decider"].priceLumps = DecideDestiny.calcCost();
}

DecideDestiny.check = function(){
	if (Game.Has('Destiny: Decided')) Game.Unlock('Destiny decider');
}


//***********************************
//    Mod functions
//***********************************

DecideDestiny.InjectIntoGoldenCookie = function(){
	Game.customShimmerTypes['golden'].customListPush.push(function(me, list){
		if(DecideDestiny.decided() && !me.force && !Game.shimmerTypes['golden'].chain){
			me.force = DecideDestiny.AllDestiniesByName[DecideDestiny.decidedDestiny].effect;
			me.wrath = 0;
			DecideDestiny.Undecide();
			
			DecideDestiny.hideSelectorBox();
		}
	});
}

DecideDestiny.AllDestiniesByName = {};
DecideDestiny.AllDestinies = [
	{name:'Undecided',        icon:[ 0, 7], effect:''},
	{name:'Frenzy',           icon:[10,14], effect:'frenzy'},
	{name:'Lucky',            icon:[27, 6], effect:'multiply cookies'},
	{name:'Building special', icon:[ 5, 6], effect:'building special', prereq:'Destiny: Architecture'},
	{name:'Dragon Harvest',   icon:[10,25], effect:'dragon harvest',   prereq:'Destiny: Agriculture'},
	{name:'Cookie chain',     icon:[20, 0], effect:'chain cookie',     prereq:'Destiny: Scattershot'},
	{name:'Cookie storm',     icon:[22, 6], effect:'cookie storm',     prereq:'Destiny: Scattershot'},
	{name:'Click frenzy',     icon:[ 0,14], effect:'click frenzy',     prereq:'Destiny: Carpal tunnel'},
	{name:'Cursed finger',    icon:[12,17], effect:'cursed finger',    prereq:'Destiny: Carpal tunnel'},
	{name:'Ruin',             icon:[11, 7], effect:'ruin cookies',     prereq:'Destiny: Misfortune',     negative:1},
	{name:'Clot',             icon:[15, 5], effect:'clot',             prereq:'Destiny: Misfortune',     negative:1},
	{name:'Dragonflight',     icon:[ 0,25], effect:'dragonflight',     prereq:'Destiny: Altitude'},
	{name:'Elder frenzy',     icon:[29, 6], effect:'blood frenzy',     prereq:'Destiny: Apocalypse',     an:1},
	{name:'Blab',             icon:[29, 8], effect:'blab',             prereq:'Destiny: Whimsy'}
];
for(var i = 0; i < DecideDestiny.AllDestinies.length; i++){
	let dest = DecideDestiny.AllDestinies[i];
	dest.id = i;
	DecideDestiny.AllDestiniesByName[dest.name] = dest;
}


DecideDestiny.CreateUpgrades = function(){
	if(!loc) var loc = (str)=>str;
	var order = Game.Upgrades["Background selector"].order + 1 / 1000;
	
	var upgrade = CCSE.NewUpgrade('Destiny decider', 'Spend sugar lumps to choose the outcome of the next natural golden cookie.', 0, [22,11]);
	upgrade.pool = 'toggle';
	upgrade.order = order;
	upgrade.priceLumps = DecideDestiny.calcCost();
	
	upgrade.descFunc = function(){
		var choice = DecideDestiny.AllDestiniesByName[DecideDestiny.RectifyDecision()];
		return '<div style="text-align:center;">' + 
			   loc("Current:") + ' ' + tinyIcon(choice.icon) + ' <b>' + choice.name + '</b>' + 
			   '</div><div class="line"></div>' + 
			   (this.ddesc?this.ddesc:this.desc)
	};
	
	upgrade.choicesFunction = function(){
		var choices = [];
		
		for (var i = 0; i < DecideDestiny.AllDestinies.length; i++){
			var temp = DecideDestiny.AllDestinies[i];
			
			if(!temp.prereq || Game.Has(temp.prereq)){
				choices[i] = {name:temp.name, icon:temp.icon};
				var neg = DecideDestiny.AllDestinies[i].negative?true:false;
				
				if(temp.name == DecideDestiny.RectifyDecision()){
					choices[i].selected = 1;
					if(i) choices[i].name = 'Destiny Decided: ' + choices[i].name;
				} else {
					if(DecideDestiny.decided()) choices[i] = 0;
					else{
						choices[i].selected = 0;
						choices[i].name += ' - ' + (neg?'gains ':'costs ') + '<span class="price lump' + ((neg||this.priceLumps<=Game.lumps) ? '' : ' disabled') + '">' + Beautify(Math.round((neg?1:this.priceLumps))) + '</span>';
					}
				}
				
			} else {
				choices[i] = 0;
			}
		}
		
		return choices;
	}
	
	upgrade.choicesPick = function(id){
		// Don't do things for Undecided of if already decided
		if(id > 0 && !DecideDestiny.decided()){
			var choice = DecideDestiny.AllDestinies[id];
			
			if(choice.negative){
				Game.gainLumps(1);
				DecideDestiny.decidedDestiny = choice.name;
				
				Game.Win('Tradeoff');
				
				DecideDestiny.hideSelectorBox();
			} else {
				Game.spendLump(DecideDestiny.calcCost(), 'decide your destiny will be a' + (choice.an?'n':'') + ' ' + choice.name, function(){
					DecideDestiny.decidedDestiny = choice.name;
					DecideDestiny.timesDecided++;
					upgrade.priceLumps = DecideDestiny.calcCost();
					
					Game.Win('Decisive');
					if(DecideDestiny.timesDecided >= 10) Game.Win('Control freak');
					if(choice.name == 'Blab') Game.Win('Whimsical');
					
					DecideDestiny.hideSelectorBox();
				})();
			}
		}
	}
	
	var placement = [[276,-205],[367,-290],[500,-300],[577,-410],[710,-420],[787,-530],[920,-540],[997,-650],[1130,-660]];
	var ups = [];
	
	ups.push(CCSE.NewHeavenlyUpgrade('Destiny: Decided',       loc("Unlocks the <b>Destiny decider</b>, letting you spend sugar lumps to choose the outcome of the next natural golden cookie."), 1e3,  [22,11], 370, -230, []));
	ups.push(CCSE.NewHeavenlyUpgrade('Destiny: Architecture',  loc("Adds the <b>Building special</b> effect to the pool of choices."),                                                            1e4,  [ 5, 6], 470, -280, ['Destiny: Decided']));
	ups.push(CCSE.NewHeavenlyUpgrade('Destiny: Agriculture',   loc("Adds the <b>Dragon Harvest</b> effect to the pool of choices."),                                                              1e5,  [10,25], 570, -330, ['Destiny: Architecture']));
	ups.push(CCSE.NewHeavenlyUpgrade('Destiny: Scattershot',   loc("Adds the <b>Cookie chain</b> and <b>Cookie storm</b> effects to the pool of choices."),                                       1e6,  [22, 6], 670, -380, ['Destiny: Agriculture']));
	ups.push(CCSE.NewHeavenlyUpgrade('Destiny: Carpal tunnel', loc("Adds the <b>Click frenzy</b> and <b>Cursed finger</b> effects to the pool of choices."),                                      1e8,  [ 0,14], 770, -430, ['Destiny: Scattershot']));
	ups.push(CCSE.NewHeavenlyUpgrade('Destiny: Misfortune',    loc("Adds the <b>Ruin</b> and <b>Clot</b> effects to the pool of choices, which will <b>give</b> sugar lumps."),                   1e9,  [15, 5], 870, -480, ['Destiny: Carpal tunnel']));
	ups.push(CCSE.NewHeavenlyUpgrade('Destiny: Altitude',      loc("Adds the <b>Dragonflight</b> effect to the pool of choices."),                                                                1e10, [ 0,25], 970, -530, ['Destiny: Misfortune']));
	ups.push(CCSE.NewHeavenlyUpgrade('Destiny: Apocalypse',    loc("Adds the <b>Elder frenzy</b> effect to the pool of choices."),                                                                1e12, [29, 6], 1070, -580, ['Destiny: Altitude']));
	ups.push(CCSE.NewHeavenlyUpgrade('Destiny: Whimsy',        loc("Adds the <b>Blab</b> effect to the pool of choices."),                                                                        1e15, [29, 8], 1170, -630, ['Destiny: Apocalypse']));
	
	for(var i = 0; i < ups.length; i++){
		ups[i].posX = placement[i][0];
		ups[i].posY = placement[i][1];
	}
	
	Game.upgradesToRebuild = 1;
}

DecideDestiny.CreateAchievements = function(){
	if(!loc) var loc = (str)=>str;
	var order = Game.Achievements['Thick-skinned'].order + 1 / 1000;
	var last;
	
	last = CCSE.NewAchievement('Decisive', 'Decided destiny <b>1 time</b>.', [22,11]); last.order = order; order += 0.001;
	last = CCSE.NewAchievement('Control freak', 'Decided destiny <b>10 times</b> in one ascension.', [22,11]); last.order = order; order += 0.001;
		last.pool = 'shadow';
	last = CCSE.NewAchievement('Tradeoff', 'Accepted a negative fate for material gain.', [15, 5]); last.order = order; order += 0.001;
	last = CCSE.NewAchievement('Whimsical', 'Decided your destiny would be a <b>Blab</b>.', [29, 8]); last.order = order; order += 0.001;
	
}

DecideDestiny.isNegative = function(){
	return DecideDestiny.AllDestiniesByName[DecideDestiny.decidedDestiny].negative == 1;
}

DecideDestiny.decided = () => DecideDestiny.RectifyDecision() !== DecideDestiny.AllDestinies[0].name;
DecideDestiny.Undecide = () => DecideDestiny.decidedDestiny = DecideDestiny.AllDestinies[0].name;

DecideDestiny.calcCost = function(){
	return Math.pow(2, DecideDestiny.timesDecided);
}

DecideDestiny.hideSelectorBox = function(){
	if(Game.choiceSelectorOn == Game.Upgrades["Destiny decider"].id) Game.Upgrades["Destiny decider"].buy();
}

DecideDestiny.debugSpawn = function(){
	Game.shimmerTypes["golden"].time = 100000;
}


//***********************************
//    RECURSIVE MODDING?!
//***********************************
DecideDestiny.RectifyDecision = function(){
	if(DecideDestiny.AllDestiniesByName[DecideDestiny.decidedDestiny]) return DecideDestiny.decidedDestiny;
	else return DecideDestiny.AllDestinies[0].name;
}

DecideDestiny.NewDestiny = function(name, icon, effect, other){
	// name, icon, and effect are required
	// See DecideDestiny.AllDestinies for the other possible properties
	if(!name || !icon || !effect) return;
	
	var dest = {name:name, icon:icon, effect:effect, id:DecideDestiny.AllDestinies.length};
	
	if(other){
		for(var i in other) dest[i] = other[i];
	}
	
	DecideDestiny.AllDestinies.push(dest);
	DecideDestiny.AllDestiniesByName[name] = dest;
	
}


//***********************************
//    Finalize
//***********************************

DecideDestiny.launch = function(){
	if(CCSE.ConfirmGameVersion(DecideDestiny.name, DecideDestiny.version, DecideDestiny.GameVersion)) Game.registerMod(DecideDestiny.name, DecideDestiny);
}

if(!DecideDestiny.isLoaded){
	if(CCSE && CCSE.isLoaded){
		DecideDestiny.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(DecideDestiny.launch);
	}
}