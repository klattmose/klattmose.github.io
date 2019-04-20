Game.Win('Third-party');
if(TimerWidget === undefined) var TimerWidget = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE.js');
TimerWidget.pic = 'https://klattmose.github.io/CookieClicker/img/timer.png';
TimerWidget.name = 'Timer Widget';
TimerWidget.version = '1.1';
TimerWidget.GameVersion = '2.019';

TimerWidget.launch = function(){
	TimerWidget.init = function(){
		TimerWidget.colorLookup = {
			'golden': 'Purple', 
			'reindeer': 'Orange', 
			'Frenzy': 'Yellow', 
			'Dragon Harvest': 'Brown', 
			'Elder frenzy': 'Green', 
			'Clot': 'Red', 
			'Click frenzy': 'Blue', 
			'Dragonflight': 'Pink'
		};
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(TimerWidget.name, TimerWidget.version);
		});
		
		Game.customSpecialTabs.push(function(){
			Game.specialTabs.push('timer');
		});
		
		Game.customDrawSpecialPic.push(function(picframe, tab){
			if(tab == 'timer'){
				picframe.pic = TimerWidget.pic;
				picframe.frame = 0;
			}
		});
		
		Game.customToggleSpecialMenu.push(TimerWidget.ToggleSpecialMenu);
		Game.customDrawSpecial.push(TimerWidget.Update);
		
		Game.customLoad.push(function(){
			l('specialPopup').className='framed prompt offScreen';
		});
		
		TimerWidget.isLoaded = 1;
	}
	
	TimerWidget.ToggleSpecialMenu = function(str){
		if(Game.specialTab == 'timer'){
			str = str.replace('background:url(img/dragon.png?v='+Game.version+');background-position:-384px 0px;', 
							  'background:url('+TimerWidget.pic+');background-position:0px 0px;');
			
			str += '<h3>Timer</h3>' + 
				   '<div class="line"></div>' + 
				   '<div id="TimerBar" style="text-align:left;margin-bottom:4px;"></div>';
		}
		
		return str;
	}
	
	TimerWidget.bar = function(name, bars, time) {
		// Put this here so we don't keep redefining it
		
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
	
	TimerWidget.Update = function(){
		if(Game.specialTab == 'timer'){
			var maxWidth = l('TimerBar').getBoundingClientRect().width - 159;
			
			l('TimerBar').innerHTML = '';
			
			for(var key in Game.shimmerTypes){
				if(Game.shimmerTypes[key].spawnConditions() && Game.shimmerTypes[key].spawned == 0 && Game.shimmerTypes[key].spawnsOnTimer){
					var TimerBarShimmer = document.createElement('div');
					TimerBarShimmer.id = 'TimerBar' + key;
					TimerBarShimmer.style.height = '12px';
					TimerBarShimmer.style.margin = '0px 10px';
					TimerBarShimmer.style.position = 'relative';
					TimerBarShimmer.appendChild(TimerWidget.bar('Next ' + key, [{id: key + 'TBMinBar', color: 'Gray'}, {id: key + 'TBBar', color: TimerWidget.colorLookup[key]}], key + 'TBTime'));
					l('TimerBar').appendChild(TimerBarShimmer);
					
					TimerBarShimmer.style.display = '';
					l(key + 'TBMinBar').style.width = Math.round(Math.max(0, Game.shimmerTypes[key].minTime - Game.shimmerTypes[key].time) * maxWidth / Game.shimmerTypes[key].maxTime) + 'px';
					if (Game.shimmerTypes[key].minTime == Game.shimmerTypes[key].maxTime) {
						l(key + 'TBMinBar').style.borderTopRightRadius = '10px';
						l(key + 'TBMinBar').style.borderBottomRightRadius = '10px';
					}
					else {
						l(key + 'TBMinBar').style.borderTopRightRadius = '';
						l(key + 'TBMinBar').style.borderBottomRightRadius = '';
					}
					l(key + 'TBBar').style.width = Math.round(Math.min(Game.shimmerTypes[key].maxTime - Game.shimmerTypes[key].minTime, Game.shimmerTypes[key].maxTime - Game.shimmerTypes[key].time) * maxWidth / Game.shimmerTypes[key].maxTime) + 'px';
					l(key + 'TBTime').textContent = Math.ceil((Game.shimmerTypes[key].maxTime - Game.shimmerTypes[key].time) / Game.fps);
				}
			}
			
			for(var i in Game.buffs){
				var buff = Game.buffs[i];
				var TimerBarBuff = document.createElement('div');
				TimerBarBuff.id = 'TimerBarBuff' + i;
				TimerBarBuff.style.height = '12px';
				TimerBarBuff.style.margin = '0px 10px';
				TimerBarBuff.style.position = 'relative';
				TimerBarBuff.appendChild(TimerWidget.bar('', [{id: TimerBarBuff.id + 'Bar'}], TimerBarBuff.id + 'Time'));
				TimerBarBuff.firstChild.firstChild.id = TimerBarBuff.id + 'Type';
				l('TimerBar').appendChild(TimerBarBuff);
				
				TimerBarBuff.style.display = '';
				l(TimerBarBuff.id + 'Type').textContent = buff.name;
				var classColor = '';
				if (typeof TimerWidget.colorLookup[Game.buffs[i].name] !== 'undefined') {
					classColor = TimerWidget.colorLookup[Game.buffs[i].name];
				}
				else {
					classColor = 'Purple';
				}
				l(TimerBarBuff.id + 'Bar').style.backgroundColor = classColor;
				l(TimerBarBuff.id + 'Bar').style.width = Math.round(Game.buffs[i].time * maxWidth / Game.buffs[i].maxTime) + 'px';
				l(TimerBarBuff.id + 'Time').textContent = Math.ceil(Game.buffs[i].time / Game.fps);
			}
		}
	}
	
	TimerWidget.init();
}


if(!TimerWidget.isLoaded){
	if(CCSE && CCSE.isLoaded){
		TimerWidget.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(TimerWidget.launch);
	}
}