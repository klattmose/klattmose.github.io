/*=====================================================================================
Just some snippets of code I might use later
=======================================================================================*/


/**

TODO:
Game.dragonLevels
Game.dragonAuras



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


Game.customShimmerTypes['reindeer'].initFunc.push(outInit)


Game.customShimmerTypes['reindeer'].spawnConditions.push(function(ret){
	return true;
})


var outMsg = function(msg){
	console.log(msg);
}
Game.customBuildings['Prism'].buyFree.push(outMsg);


Game.customBuildings['Prism'].tooltip.push(function(obj, ret){
	return '<div style="min-width:350px;padding:8px;">Replaced!</div>';
});


Game.customBuildings['Cursor'].cpsAdd.push(function(){return 500000000});


for(var i in Game.Upgrades){
	var up = Game.Upgrades[i]
	if(up.buyFunction) console.log(i)
	if(up.buyFunction) console.log(up.buyFunction.toString())
}





Game.Win('Third-party');
if(testTimer === undefined) var testTimer = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/Beta/CCSE.js');
testTimer.pic = 'https://klattmose.github.io/CookieClicker/Beta/img/timer.png';

testTimer.launch = function(){
	testTimer.init = function(){
		Game.customSpecialTabs.push(function(){
			Game.specialTabs.push('timer');
		});
		
		Game.customDrawSpecialPic.push(function(picframe, tab){
			if(tab == 'timer'){
				picframe.pic = testTimer.pic;
				picframe.frame = 0;
			}
		});
		
		Game.customToggleSpecialMenu.push(testTimer.ToggleSpecialMenu);
		Game.customDrawSpecial.push(testTimer.Update);
		
		testTimer.isLoaded = 1;
	}
	
	testTimer.ToggleSpecialMenu = function(str){
		if(Game.specialTab == 'timer'){
			var bar = function(name, bars, time) {
				var div = document.createElement('div');
				div.style.width = '100%';
				div.style.height = '10px';
				div.style.margin = 'auto';
				div.style.position = 'absolute';
				div.style.left = '0px';
				div.style.top = '0px';
				div.style.right = '0px';
				div.style.bottom = '0px';

				var type = document.createElement('span');
				type.style.display = 'inline-block';
				type.style.textAlign = 'right';
				type.style.width = '108px';
				type.style.marginRight = '5px';
				type.style.verticalAlign = 'text-top';
				type.textContent = name;
				div.appendChild(type);

				for (var i = 0; i < bars.length; i++) {
					var colorBar = document.createElement('span');
					colorBar.id = bars[i].id
					colorBar.style.display = 'inline-block';
					colorBar.style.height = '10px';
					if (bars.length - 1 == i) {
						colorBar.style.borderTopRightRadius = '10px';
						colorBar.style.borderBottomRightRadius = '10px';
					}
					if (typeof bars[i].color !== 'undefined') {
						colorBar.style.backgroundColor = bars[i].color;
					}
					div.appendChild(colorBar);
				}

				var timer = document.createElement('span');
				timer.id = time;
				timer.style.marginLeft = '5px';
				timer.style.verticalAlign = 'text-top';
				div.appendChild(timer);
				return div
			}
			
			str = str.replace('background:url(img/dragon.png?v='+Game.version+');background-position:-384px 0px;', 
							  'background:url('+testTimer.pic+');background-position:0px 0px;');
			
			str += '<h3>Timer</h3>' + 
				   '<div class="line"></div>' + 
				   '<div id="TimerBar" style="margin-bottom:4px;">';

			var TimerBarGC = document.createElement('div');
			TimerBarGC.id = 'TimerBarGC';
			TimerBarGC.style.height = '12px';
			TimerBarGC.style.margin = '0px 10px';
			TimerBarGC.style.position = 'relative';
			TimerBarGC.appendChild(bar('Next Cookie', [{id: 'TimerBarGCMinBar', color: 'Gray'}, {id: 'TimerBarGCBar', color: 'Purple'}], 'TimerBarGCTime'));
			str += TimerBarGC.outerHTML;

			var TimerBarRen = document.createElement('div');
			TimerBarRen.id = 'TimerBarRen';
			TimerBarRen.style.height = '12px';
			TimerBarRen.style.margin = '0px 10px';
			TimerBarRen.style.position = 'relative';
			TimerBarRen.appendChild(bar('Next Reindeer', [{id: 'TimerBarRenMinBar', color: 'Gray'}, {id: 'TimerBarRenBar', color: 'Orange'}], 'TimerBarRenTime'));
			str += TimerBarRen.outerHTML;
			
			
			str += '</div>';
		}
		
		return str;
	}
	
	testTimer.Update = function(){
		if(Game.specialTab == 'timer'){
			console.log(Date.now())
		}
	}
	
	testTimer.init();
}


if(!testTimer.isLoaded){
	if(CCSE && CCSE.isLoaded){
		testTimer.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(testTimer.launch);
	}
}