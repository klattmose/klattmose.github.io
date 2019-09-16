Game.Win('Third-party');
if(TimerWidget === undefined) var TimerWidget = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (0 ? 'Beta/' : '') + 'CCSE.js');
TimerWidget.pic = 'https://klattmose.github.io/CookieClicker/img/timer.png';
TimerWidget.name = 'Timer Widget';
TimerWidget.version = '1.6';
TimerWidget.GameVersion = '2.02';

TimerWidget.launch = function(){
	TimerWidget.init = function(){
		TimerWidget.colorLookup = {
			'golden': 			'#ff00ff', 
			'reindeer': 		'#ff7f00', 
			'Frenzy': 			'#ffff00', 
			'Dragon Harvest': 	'#8b4513', 
			'Elder frenzy': 	'#00ff00', 
			'Clot': 			'#ff0000', 
			'Click frenzy': 	'#4bb8f0', 
			'Dragonflight': 	'#ff1493',
			'default': 			'#ff00ff'
		};
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(TimerWidget.name, TimerWidget.version);
		});
		
		CCSE.CreateSpecialObject('timer', 
			function(){return true;}, 
			function(picframe){
				picframe.pic = TimerWidget.pic;
				picframe.frame = 0;
			}, 
			TimerWidget.ToggleSpecialMenu
		);
		
		Game.customDrawSpecial.push(TimerWidget.Update);
		
		Game.customLoad.push(function(){
			l('specialPopup').className='framed prompt offScreen';
		});
		
		TimerWidget.isLoaded = 1;
	}
	
	TimerWidget.ToggleSpecialMenu = function(str){
		str = CCSE.SetSpecialMenuImage(str, TimerWidget.pic, 0);
		
		str += '<h3>Timer</h3>' + 
			   '<div class="line"></div>' + 
			   '<div id="TimerBar" style="text-align:left;margin-bottom:4px;"></div>';
		
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
		type.style.width = '117px';
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
			var maxWidth = l('TimerBar').getBoundingClientRect().width - 185;
			
			l('TimerBar').innerHTML = '';
			
			for(var key in Game.shimmerTypes){
				if(Game.shimmerTypes[key].spawnConditions() && Game.shimmerTypes[key].spawned == 0 && Game.shimmerTypes[key].spawnsOnTimer){
					var TimerBarShimmer = document.createElement('div');
					TimerBarShimmer.id = 'TimerBar' + key;
					TimerBarShimmer.style.height = '12px';
					TimerBarShimmer.style.margin = '0px 10px';
					TimerBarShimmer.style.position = 'relative';
					
					if (typeof TimerWidget.colorLookup[key] !== 'undefined') {
						classColor = TimerWidget.colorLookup[key];
					}
					else {
						classColor = TimerWidget.colorLookup['default'];
					}
					
					TimerBarShimmer.appendChild(TimerWidget.bar('Next ' + key, [{id: key + 'TBMinBar', color: '#b3b3b3'}, {id: key + 'TBBar', color: classColor}], key + 'TBTime'));
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
					classColor = TimerWidget.colorLookup['default'];
				}
				l(TimerBarBuff.id + 'Bar').style.backgroundColor = classColor;
				l(TimerBarBuff.id + 'Bar').style.width = Math.round(Game.buffs[i].time * maxWidth / Game.buffs[i].maxTime) + 'px';
				l(TimerBarBuff.id + 'Time').textContent = Math.ceil(Game.buffs[i].time / Game.fps);
			}
		}
	}
	
	if(CCSE.ConfirmGameVersion(TimerWidget.name, TimerWidget.version, TimerWidget.GameVersion)) TimerWidget.init();
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