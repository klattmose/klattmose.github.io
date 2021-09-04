Game.registerMod("Unshy Prestige Upgrades",{
	init:function(){
		for(var i in Game.Upgrades){
			if(Game.Upgrades[i].showIf) Game.Upgrades[i].showIf = 0;
		}
	}
});