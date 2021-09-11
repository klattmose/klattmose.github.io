Game.registerMod("More Background Options",{
	init:function(){
		var runAfterCCSEload = function(){
			CCSE.NewBackgroundSelection('Garden',  [ 2, 0],'BGgarden.jpg');
			CCSE.NewBackgroundSelection('Market',  [15, 0],'BGmarket.jpg');
			CCSE.NewBackgroundSelection('Pantheon',[16, 0],'BGpantheon.jpg');
			CCSE.NewBackgroundSelection('Grimoire',[17, 0],'BGgrimoire.jpg');
			CCSE.NewBackgroundSelection('Darkness',[21, 0],'darkNoise.jpg');
			CCSE.NewBackgroundSelection('Snow',    [13,10],'snow.jpg');
			CCSE.NewBackgroundSelection('Stars',   [15, 7],'starbg.jpg');
		}
		
		if(CCSE.isLoaded){
			runAfterCCSEload();
		}
		else{
			if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
			CCSE.postLoadHooks.push(runAfterCCSEload);
		}
	}
});