Game.registerMod('Predictable Plant Growth', {
	init: function(){
		CCSE.MinigameReplacer(function(){
			var objKey = 'Farm';
			var M = Game.Objects[objKey].minigame;
			
			for(var key in M.plants){
				let it = M.plants[key];
				
				it.ageTick = Math.ceil(it.ageTick + (it.ageTickR / 2));
				it.ageTickR = 0;
				
			}
			M.toCompute = 1;
			
		}, 'Farm');
		
		//CCSE.MenuHelper.AutoVersion(this);
	}
})