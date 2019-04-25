/*=====================================================================================
Just some snippets of code I might use later
=======================================================================================*/


/**

TODO:

Fortune Cookie: Add customizable colors for FtHoF


**/



if(Date.now() >= new Date(new Date().getFullYear(), 7 - 1, 1) && Date.now() <= new Date(new Date().getFullYear(), 7 - 1, 7)){
	Game.baseSeason = 'american';
}

https://redd.it/bcw40e



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



var doubledHC = function(){
	return 2;
}
Game.customHeavenlyMultiplier.push(doubledHC);


Game.customComputeLumpTimes.push(function(){
	Game.lumpMatureAge /= 2000;
	Game.lumpRipeAge /= 2000;
	Game.lumpOverripeAge /= 2000;
})


Game.customCanLumps.push(function(ret){
	return true;
})

// pops too fast
Game.customShimmer.push(function(shimmer){
	setTimeout(shimmer.pop, 10);
});


Game.customShimmerTypes['golden'].customEffectDurMod.push(function(ret){
	return 10;
})


Game.customShimmerTypes['reindeer'].spawnConditions.push(function(ret){
	return true;
})


Game.customBuildings['Prism'].buyFree.push(function(msg){
	console.log(msg);
});


Game.customBuildings['Prism'].tooltip.push(function(obj, ret){
	return '<div style="min-width:350px;padding:8px;">Replaced!</div>';
});


Game.customBuildings['Cursor'].cpsAdd.push(function(){return 500000000});


for(var i in Game.Upgrades){
	var up = Game.Upgrades[i]
	if(up.buyFunction) console.log(i)
	if(up.buyFunction) console.log(up.buyFunction.toString())
}


Game.customRebuildUpgrades.push(function(){
	var cnt = 0;
	for (var i in Game.UpgradesInStore){
		var me = Game.UpgradesInStore[i];
		if(me.pool != 'toggle' && me.pool != 'tech' && !(me.isVaulted && Game.Has('Inspired checklist'))) cnt++;
	}
	if(cnt) l('upgrades').style.display = 'block';
	else l('upgrades').style.display = 'none';
});


Game.customMinigame['Farm'].getMuts.push(function(neighs, neighsM, muts){
	if (neighsM['chocoroot']>=1 && neighsM['thumbcorn']>=1) muts.push(['queenbeetLump',1]);
})


Game.customMinigame['Wizard tower'].fateWin.push(function(choices){
	if(Math.random() < 0.5) choices.push('free sugar lump');
});
FortuneCookie.customFateCheckerWin.push(function(spellCount, idx, choices){
	if(Math.random() < 0.5) choices.push('Free Sugar Lump');
});