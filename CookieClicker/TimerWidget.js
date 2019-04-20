Game.Win('Third-party');
if(TimerWidget === undefined) var TimerWidget = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE.js');
TimerWidget.pic = 'https://klattmose.github.io/CookieClicker/img/timer.png';
TimerWidget.name = 'Horticookie';
TimerWidget.version = '1.0';
TimerWidget.GameVersion = '2.019';

TimerWidget.launch = function(){
	TimerWidget.init = function(){
		TimerWidget.buffColors = {
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
	
	TimerWidget.Update = function(){
		if(Game.specialTab == 'timer'){
			var maxWidth = l('TimerBar').getBoundingClientRect().width - 159;
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
			
			l('TimerBar').innerHTML = '';
			
			if(Game.shimmerTypes["golden"].spawnConditions() && Game.shimmerTypes['golden'].spawned == 0){
				var TimerBarGC = document.createElement('div');
				TimerBarGC.id = 'TimerBarGC';
				TimerBarGC.style.height = '12px';
				TimerBarGC.style.margin = '0px 10px';
				TimerBarGC.style.position = 'relative';
				TimerBarGC.appendChild(bar('Next Cookie', [{id: 'TimerBarGCMinBar', color: 'Gray'}, {id: 'TimerBarGCBar', color: 'Purple'}], 'TimerBarGCTime'));
				l('TimerBar').appendChild(TimerBarGC);
				
				TimerBarGC.style.display = '';
				l('TimerBarGCMinBar').style.width = Math.round(Math.max(0, Game.shimmerTypes['golden'].minTime - Game.shimmerTypes['golden'].time) * maxWidth / Game.shimmerTypes['golden'].maxTime) + 'px';
				if (Game.shimmerTypes['golden'].minTime == Game.shimmerTypes['golden'].maxTime) {
					l('TimerBarGCMinBar').style.borderTopRightRadius = '10px';
					l('TimerBarGCMinBar').style.borderBottomRightRadius = '10px';
				}
				else {
					l('TimerBarGCMinBar').style.borderTopRightRadius = '';
					l('TimerBarGCMinBar').style.borderBottomRightRadius = '';
				}
				l('TimerBarGCBar').style.width = Math.round(Math.min(Game.shimmerTypes['golden'].maxTime - Game.shimmerTypes['golden'].minTime, Game.shimmerTypes['golden'].maxTime - Game.shimmerTypes['golden'].time) * maxWidth / Game.shimmerTypes['golden'].maxTime) + 'px';
				l('TimerBarGCTime').textContent = Math.ceil((Game.shimmerTypes['golden'].maxTime - Game.shimmerTypes['golden'].time) / Game.fps);
			}
			
			if(Game.shimmerTypes["reindeer"].spawnConditions() && Game.shimmerTypes['reindeer'].spawned == 0){
				var TimerBarRen = document.createElement('div');
				TimerBarRen.id = 'TimerBarRen';
				TimerBarRen.style.height = '12px';
				TimerBarRen.style.margin = '0px 10px';
				TimerBarRen.style.position = 'relative';
				TimerBarRen.appendChild(bar('Next Reindeer', [{id: 'TimerBarRenMinBar', color: 'Gray'}, {id: 'TimerBarRenBar', color: 'Orange'}], 'TimerBarRenTime'));
				l('TimerBar').appendChild(TimerBarRen);
				
				TimerBarRen.style.display = '';
				l('TimerBarRenMinBar').style.width = Math.round(Math.max(0, Game.shimmerTypes['reindeer'].minTime - Game.shimmerTypes['reindeer'].time) * maxWidth / Game.shimmerTypes['reindeer'].maxTime) + 'px';
				l('TimerBarRenBar').style.width = Math.round(Math.min(Game.shimmerTypes['reindeer'].maxTime - Game.shimmerTypes['reindeer'].minTime, Game.shimmerTypes['reindeer'].maxTime - Game.shimmerTypes['reindeer'].time) * maxWidth / Game.shimmerTypes['reindeer'].maxTime) + 'px';
				l('TimerBarRenTime').textContent = Math.ceil((Game.shimmerTypes['reindeer'].maxTime - Game.shimmerTypes['reindeer'].time) / Game.fps);
			}
			
			for(var i in Game.buffs){
				var buff = Game.buffs[i];
				var TimerBarBuff = document.createElement('div');
				TimerBarBuff.id = 'TimerBarBuff' + i;
				TimerBarBuff.style.height = '12px';
				TimerBarBuff.style.margin = '0px 10px';
				TimerBarBuff.style.position = 'relative';
				TimerBarBuff.appendChild(bar('', [{id: TimerBarBuff.id + 'Bar'}], TimerBarBuff.id + 'Time'));
				TimerBarBuff.firstChild.firstChild.id = TimerBarBuff.id + 'Type';
				l('TimerBar').appendChild(TimerBarBuff);
				
				TimerBarBuff.style.display = '';
				l(TimerBarBuff.id + 'Type').textContent = buff.name;
				var classColor = '';
				if (typeof TimerWidget.buffColors[Game.buffs[i].name] !== 'undefined') {
					classColor = TimerWidget.buffColors[Game.buffs[i].name];
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