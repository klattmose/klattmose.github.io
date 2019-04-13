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


var output = '';
var recursiveNaming = function(obj, path){
	for(var key in obj){
		var child = obj[key];
		if(typeof child == 'function') console.log(path + '.' + key);
		//else if(typeof child == 'object') recursiveNaming(child, path + '.' + key);
	}
}

recursiveNaming(Game, 'Game');


var doubledHC = function(){
	return 2;
}

Game.customHeavenlyMultiplier.push(doubledHC);