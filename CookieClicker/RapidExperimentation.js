/*=====================================================================================
Just some snippets of code I might use later
=======================================================================================*/


/**

TODO:

Fortune Cookie: Add customizable colors for FtHoF

CCSE: addLumpType

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


CCSE.NewBuff('hurricane sugar',function(time, pow){
	return {
		name: 'Hurri-Cane Sugar',
		desc: 'Cookie production x'+pow+' for '+Game.sayTime(time*Game.fps,-1)+'!',
		icon:[29,14],
		time:time*Game.fps,
		add:true,
		power:pow
	};
});


CCSE.NewBuilding('Test building','test building|test building|processed|[X] extra test|[X] extra tests','Runs cookies through various tests to prove their deliciousness.',11,7,{base:'portal',xV:32,yV:32,w:64,rows:2,x:0,y:0},1666666,function(me){
	var mult=1;
	mult*=Game.GetTieredCpsMult(me);
	mult*=Game.magicCpS(me.name);
	return me.baseCps*mult;
},function(){
	Game.UnlockTiered(this);
	if (this.amount>=Game.SpecialGrandmaUnlock && Game.Objects['Grandma'].amount>0) Game.Unlock(this.grandma.name);
});

var seed = {
				name:'Baker\'s wheat',
				icon:0,
				cost:1,
				costM:30,
				ageTick:7,
				ageTickR:2,
				mature:35,
				children:['bakerWheat','thumbcorn','cronerice','bakeberry','clover','goldenClover','chocoroot','tidygrass'],
				effsStr:'<div class="green">&bull; +1% CpS</div>',
				q:'A plentiful crop whose hardy grain is used to make flour for pastries.',
				onHarvest:function(x,y,age)
				{
					if (age>=this.mature) M.dropUpgrade('Wheat slims',0.001);
				},
			}
CCSE.NewPlant('test',seed);



calculateOne = function(spellCount, idx, backfire){
	var FTHOFcookie = '';
	Math.seedrandom(Game.seed + '/' + spellCount);
	roll = Math.random();
	
	if(roll < (1 - backfire)){
		/* Random is called a few times in setting up the golden cookie */
		if (idx > 0) Math.random();
		if (idx > 1) Math.random();
		Math.random();
		Math.random();
		
		var choices = [];
		choices.push('Frenzy','Lucky');
		if (!Game.hasBuff('Dragonflight')) choices.push('Click Frenzy');
		if (Math.random() < 0.1) choices.push('Cookie Storm','Cookie Storm','Blab');
		if (Game.BuildingsOwned >= 10 && Math.random() < 0.25) choices.push('Building Special');
		if (Math.random() < 0.15) choices = ['Cookie Storm Drop'];
		if (Math.random() < 0.0001) choices.push('Free Sugar Lump');
		
		FTHOFcookie = choose(choices);
		
	} else {
		/* Random is called a few times in setting up the golden cookie */
		if (idx > 0) Math.random();
		if (idx > 1) Math.random();
		Math.random();
		Math.random();
		
		var choices = [];
		choices.push('Clot','Ruin');
		if (Math.random() < 0.1) choices.push('Cursed Finger','Elder Frenzy');
		if (Math.random() < 0.003) choices.push('Free Sugar Lump');
		if (Math.random() < 0.1) choices=['Blab'];
		
		FTHOFcookie = choose(choices);
		
	}
	
	return FTHOFcookie;
}

calculateAll = function(spellForecastLength, simulatedGCs){
	var res = [];
	
	if(spellForecastLength == 0) return res;
	var M = Game.Objects["Wizard tower"].minigame;
	var backfire = M.getFailChance('Force the Hand of Fate');
	var spellsCast = M.spellsCastTotal;
	var target = spellsCast + spellForecastLength;
	var idx = ((Game.season == "valentines" || Game.season == "easter") ? 1 : 0);
	
	backfire += 0.15 * simulatedGCs;
	
	while(spellsCast < target){
		var spellOutcome = [];
		
		for(var i = 0; i < 2; i++)
			spellOutcome[i] = calculateOne(spellsCast, i, backfire);
		
		res.push(spellOutcome);
		spellsCast += 1;
		Math.seedrandom();
	}
	
	return res;
}




// Old obsolete mod hooks
// Game.customChecks=[];//push functions into this to add them to the "check for upgrade/achievement conditions" that happens every few seconds
// Game.customInit=[];//add to the initialization call
// Game.customLogic=[];//add to the logic calls
// Game.customDraw=[];//add to the draw calls
Game.customSave=[];//add to the save write calls
Game.customLoad=[];//add to the save load calls
Game.customReset=[];//add to the reset calls
// Game.customTickers=[];//add to the random tickers (functions should return arrays of text)
// Game.customCps=[];//add to the CpS computation (functions should return something to add to the multiplier ie. 0.1 for an addition of 10 to the CpS multiplier)
// Game.customCpsMult=[];//add to the CpS multiplicative computation (functions should return something to multiply by the multiplier ie. 1.05 for a 5% increase of the multiplier)
// Game.customMouseCps=[];//add to the cookies earned per click computation (functions should return something to add to the multiplier ie. 0.1 for an addition of 10 to the CpS multiplier)
// Game.customMouseCpsMult=[];//add to the cookies earned per click multiplicative computation (functions should return something to multiply by the multiplier ie. 1.05 for a 5% increase of the multiplier)
// Game.customCookieClicks=[];//add to the cookie click calls
// Game.customCreate=[];//create your new upgrades and achievements in there