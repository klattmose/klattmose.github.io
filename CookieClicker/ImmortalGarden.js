Game.registerMod('Immortal Garden', {
	init: function(){
		CCSE.MinigameReplacer(function(){
			var objKey = 'Farm';
			var M = Game.Objects[objKey].minigame;
			
			for(var key in M.plants){
				if(M.plants[key].immortal){} // Do nothing
				else{
					M.plants[key].immortal = 1;
					M.plants[key].detailsStr = (M.plants[key].detailsStr ? M.plants[key].detailsStr + ', i' : 'I') + 'mmortal';
				}
			}
			M.toCompute = 1;
			
		}, 'Farm');
		
		//CCSE.MenuHelper.AutoVersion(this);
	}
})