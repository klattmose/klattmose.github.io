Game.registerMod("Steam Achievement Enabler",{
	init:function(){
		if(Steam){
			Steam.allowSteamAchievs = true;
			eval('Steam.justLoadedSave=' + Steam.justLoadedSave.toString().replace("Game.HasAchiev('Cheated cookies taste awful')", false));
		}
	}
});