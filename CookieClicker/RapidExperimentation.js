/*=====================================================================================
Just some snippets of code I might use later
=======================================================================================*/


if(Date.now() >= new Date(new Date().getFullYear(), 7 - 1, 1) && Date.now() <= new Date(new Date().getFullYear(), 7 - 1, 7)){
	Game.baseSeason = 'american';
}



var spell = {
	name: 'Test',
	desc: 'test description.',
	failDesc: 'test fail description.',
	icon: [0, 0],
	costMin: 10,
	costPercent: 0.1,
	win: function(){
		Game.Popup('<div style="font-size:80%;">win</div>',Game.mouseX,Game.mouseY);
	},
	fail: function(){
		Game.Popup('<div style="font-size:80%;">fail</div>',Game.mouseX,Game.mouseY);
	}
}
CCSE.NewSpell('test', spell)



CCSE.NewHeavenlyUpgrade = function(name, desc, price, icon, posX, posY, parents, buyFunction){
	var me = new Game.Upgrade(name, desc, price, icon, buyFunction);
	Game.PrestigeUpgrades.push(me);
	
	me.pool = 'prestige';
	me.posX = posX;
	me.posY = posY;
	
	me.parents = parents;
	if(me.parents.length == 0) me.parents = ['Legacy'];
	me.parents = me.parents || [-1];
	for(var ii in me.parents){
		if(me.parents[ii] != -1) me.parents[ii] = Game.Upgrades[me.parents[ii]];
	}
	
	return me;
}