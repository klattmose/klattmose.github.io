if(HurricaneSugar === undefined) var HurricaneSugar = {};
HurricaneSugar.name = 'Hurricane Sugar';
HurricaneSugar.version = '1.7';
HurricaneSugar.GameVersion = '2.042';

HurricaneSugar.launch = function(){
	HurricaneSugar.init = function(){
		CCSE.NewBuff('hurricane sugar',function(time, pow){
			return {
				name: 'Hurri-Cane Sugar',
				desc: 'Sugar lumps ripen in ' + Game.sayTime(pow * 2 / 1000 * Game.fps, -1) + ' for ' + Game.sayTime(time * Game.fps, -1) + '!',
				icon: [29,14],
				time: time * Game.fps,
				add: true,
				power: pow
			};
		});
		
		Game.customComputeLumpTimes.push(HurricaneSugar.buffedLumpTime);
		HurricaneSugar.InjectIntoGoldenCookie();
		HurricaneSugar.InjectIntoHandofFate(); // Don't need CCSE.MinigameReplacer if we just push to CCSE arrays
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(HurricaneSugar.name, HurricaneSugar.version);
		});
		
		HurricaneSugar.isLoaded = 1;
		if (Game.prefs.popups) Game.Popup(HurricaneSugar.name + ' loaded!');
		else Game.Notify(HurricaneSugar.name + ' loaded!', '', '', 1, 1);
	}
	
	HurricaneSugar.buffedLumpTime = function(){
		if(Game.hasBuff('Hurri-Cane Sugar')){
			var buff = Game.buffs['Hurri-Cane Sugar'];
			Game.lumpMatureAge = buff.power;
			Game.lumpRipeAge = buff.power * 2;
			Game.lumpOverripeAge = buff.power * 10;
		}
	}
	
	HurricaneSugar.InjectIntoGoldenCookie = function(){
		Game.customShimmerTypes['golden'].customListPush.push(function(me, list){
			if(me.wrath == 0 && Game.canLumps() && Math.random() < 0.05) list.push('hurricane sugar');
		});
		
		Game.customShimmerTypes['golden'].customBuff.push(function(me, buff, choice, effectDurMod, mult){
			var ret = buff;
			if(choice == 'hurricane sugar') ret = Game.gainBuff('hurricane sugar', Math.ceil(5 * effectDurMod), 500);
			return ret;
		});
		
		Game.goldenCookieChoices.push('Hurri-Cane Sugar','hurricane sugar');
	}
	
	HurricaneSugar.InjectIntoHandofFate = function(){
		if(!Game.customMinigame['Wizard tower'].fateWin) Game.customMinigame['Wizard tower'].fateWin = [];
		Game.customMinigame['Wizard tower'].fateWin.push(function(choices){
			if(Math.random() < 0.05) choices.push('hurricane sugar');
		});
		
		if(typeof FortuneCookie == 'undefined') FortuneCookie = {};
		if(FortuneCookie.customFateCheckerWin === undefined) FortuneCookie.customFateCheckerWin = [];
		FortuneCookie.customFateCheckerWin.push(function(spellCount, idx, choices){
			if(Math.random() < 0.05) choices.push('Hurri-Cane Sugar');
		});
	}
	
	
	if(CCSE.ConfirmGameVersion(HurricaneSugar.name, HurricaneSugar.version, HurricaneSugar.GameVersion)) HurricaneSugar.init();
}


if(!HurricaneSugar.isLoaded){
	if(CCSE && CCSE.isLoaded){
		HurricaneSugar.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(HurricaneSugar.launch);
	}
}