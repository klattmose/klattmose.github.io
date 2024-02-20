Game.registerMod("Steam Achievement Enabler",{
	init:function(){
		if(Steam){
			if(!Steam.allowSteamAchievs){
				Steam.allowSteamAchievs = true;
				Steam.justLoadedSave();
			}
		}
	}
});