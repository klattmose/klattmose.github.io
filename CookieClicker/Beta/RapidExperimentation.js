if(Date.now() >= new Date(new Date().getFullYear(), 7 - 1, 1) && Date.now() <= new Date(new Date().getFullYear(), 7 - 1, 7)){
	Game.baseSeason = 'american';
}

CCSE.NewSpell('test', 'Test', 'test description', 'test fail description', [0,0], 10, 0.1, '', new function(){return function(){console.log('win');}}, new function(){return function(){console.log('fail');}})