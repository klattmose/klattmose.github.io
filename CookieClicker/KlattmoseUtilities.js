Game.Win('Third-party');
if(KlattmoseUtilities === undefined) {
	var KlattmoseUtilities = {};
	
	KlattmoseUtilities.Backup = {};
	KlattmoseUtilities.Repeaters = {};
	KlattmoseUtilities.RepeaterFlags = {};
	KlattmoseUtilities.ConfigPrefix = "KlattmoseUtilities";
	KlattmoseUtilities.waitingForInput = 0;
	
	KlattmoseUtilities.toLoad = 1;
}

KlattmoseUtilities.defaultConfig = function(){
	return {
	  "hotkeys": [
		{
		  "keyCode": 79,
		  "nickname": "Options Menu",
		  "ctrl": false,
		  "shift": false,
		  "alt": false,
		  "script": "Game.ShowMenu('prefs');"
		},
		{
		  "keyCode": 83,
		  "nickname": "Stats Menu",
		  "ctrl": false,
		  "shift": false,
		  "alt": false,
		  "script": "Game.ShowMenu('stats');"
		},
		{
		  "keyCode": 73,
		  "nickname": "Info Menu",
		  "ctrl": false,
		  "shift": false,
		  "alt": false,
		  "script": "Game.ShowMenu('log');"
		},
		{
		  "keyCode": 49,
		  "nickname": "Quickload",
		  "ctrl": false,
		  "shift": false,
		  "alt": false,
		  "script": "Game.LoadSave();"
		},
		{
		  "keyCode": 50,
		  "nickname": "Godzamok",
		  "ctrl": false,
		  "shift": false,
		  "alt": false,
		  "script": "Game.Objects[\"Mine\"].sell(400); Game.Objects[\"Mine\"].buy(400);"
		},
		{
		  "keyCode": 51,
		  "nickname": "Dump Wizards",
		  "ctrl": false,
		  "shift": false,
		  "alt": false,
		  "script": "var temp = Game.Objects[\"Wizard tower\"].minigame.magic;\nvar lvl=Math.max(Game.Objects[\"Wizard tower\"].level,1);\nfor(var i = 1; i < Game.Objects[\"Wizard tower\"].amount; i++){\n\tif(temp <= Math.floor(4+Math.pow(i,0.6)+Math.log((i+(lvl-1)*10)/15+1)*15)) \n\t\tGame.Objects[\"Wizard tower\"].sell(Game.Objects[\"Wizard tower\"].amount - i);\n}"
		},
		{
		  "keyCode": 52,
		  "nickname": "Sugar Lump Appraisal",
		  "ctrl": false,
		  "shift": false,
		  "alt": false,
		  "script": "var temp = Game.lumpCurrentType;\nvar str = 'normal';\nif (temp == 1) str = 'bifurcated';\nelse if (temp == 2) str = 'golden';\nelse if (temp == 3) str = 'meaty';\nelse if (temp == 4) str = 'caramelized';\nGame.Notify('A ' + str + ' sugar lump is growing!', '', [29,14+temp+(temp==4?9:0)]);"
		},
		{
		  "keyCode": 81,
		  "nickname": "Autoclicker",
		  "ctrl": false,
		  "shift": false,
		  "alt": false,
		  "period": "10",
		  "script": "Game.ClickCookie();"
		},
		{
		  "keyCode": 87,
		  "nickname": "Golden Autoclicker",
		  "ctrl": false,
		  "shift": false,
		  "alt": false,
		  "period": "500",
		  "script": "Game.shimmers.forEach(function(shimmer) { if (shimmer.type == \"golden\" || shimmer.type == \"reindeer\") { shimmer.pop() } })"
		},
		{
		  "keyCode": 69,
		  "nickname": "Wrinkler Harvest",
		  "ctrl": false,
		  "shift": false,
		  "alt": false,
		  "period": "60000",
		  "script": "Game.CollectWrinklers();"
		},
		{
		  "keyCode": 82,
		  "nickname": "Autospell",
		  "ctrl": false,
		  "shift": false,
		  "alt": false,
		  "script": "var M = Game.Objects[\"Wizard tower\"].minigame;\nif(M.magic == M.magicM) M.castSpell(M.spells[\"haggler's charm\"]);",
		  "period": "1000"
		},
		{
		  "keyCode": 84,
		  "nickname": "Cookie Monster Autobuy",
		  "ctrl": false,
		  "shift": false,
		  "alt": false,
		  "script": "for(var i = 0; i < Game.ObjectsById.length; i++){\n\tif(l(\"productPrice\" + i).getAttribute(\"style\") == \"color: rgb(0, 255, 0);\"){\n\t\tvar obj = Game.ObjectsById[i];\n\t\tif(obj.price < Game.cookies) {\n\t\t\tobj.buy(1);\n\t\t\tGame.Notify('Bought a ' + obj.name, '', '', 1, 1);\n\t\t}\n\t}\n}",
		  "period": "1000"
		}
	  ],
	  "patches": {
		"gamblersFeverDreamFix": 0,
		"slotGodFix": 0
	  }
	}
}

KlattmoseUtilities.init = function(){
	KlattmoseUtilities.toLoad = 0;
	
	KlattmoseUtilities.restoreDefaultConfig(1);
	KlattmoseUtilities.loadConfig();
	
	KlattmoseUtilities.Backup.scriptLoaded = Game.scriptLoaded;
	Game.scriptLoaded = function(who, script) {
		KlattmoseUtilities.Backup.scriptLoaded(who, script);
		KlattmoseUtilities.ReplaceNativeGarden();
		KlattmoseUtilities.ReplaceNativePantheon();
		KlattmoseUtilities.ReplaceNativeGrimoire();
	}
	
	KlattmoseUtilities.ReplaceNativeGarden();
	KlattmoseUtilities.ReplaceNativePantheon();
	KlattmoseUtilities.ReplaceNativeGrimoire();
	
	KlattmoseUtilities.oldUpdateMenu = Game.UpdateMenu;
	Game.UpdateMenu = function(){
		KlattmoseUtilities.oldUpdateMenu();
		
		if(KlattmoseUtilities.config.hotkeys === undefined) KlattmoseUtilities.config.hotkeys = {};
		if(KlattmoseUtilities.config.patches === undefined) KlattmoseUtilities.config.patches = {};
		
		var writeHeader = function(text) {
			var div = document.createElement('div');
			div.className = 'listing';
			div.style.padding = '5px 16px';
			div.style.opacity = '0.7';
			div.style.fontSize = '17px';
			div.style.fontFamily = '\"Kavoon\", Georgia, serif';
			div.textContent = text;
			return div.outerHTML;
		}
		
		var WriteButton = function(patchName, button, on, off, callback, invert){
			var invert = invert ? 1 : 0;
			if (!callback) callback = '';
			callback += 'PlaySound(\'snd/tick.mp3\');';
			return '<a class="option' + ((KlattmoseUtilities.config.patches[patchName]^invert) ? '' : ' off') + '" id="' + button + '" ' + Game.clickStr + '="KlattmoseUtilities.patches.Toggle(\'' + patchName + '\',\'' + button + '\',\'' + on.replace("'","\\'") + '\',\'' + off.replace("'","\\'") + '\',\'' + invert + '\');' + callback + '">' + (KlattmoseUtilities.config.patches[patchName] ? on : off) + '</a>';
		}
		
		if(Game.onMenu === 'prefs') {
			var str =	'<div class="title">Klattmose Utilities</div>' + 
						'<div class="listing"><a class="option" ' + Game.clickStr + '="KlattmoseUtilities.restoreDefaultConfig(2); PlaySound(\'snd/tick.mp3\'); Game.UpdateMenu();">Restore Default</a></div>' + 
						'<div class="listing"><a class="option" ' + Game.clickStr + '="KlattmoseUtilities.exportConfig(); PlaySound(\'snd/tick.mp3\');">Export configuration</a>' +
											 '<a class="option" ' + Game.clickStr + '="KlattmoseUtilities.importConfig(); PlaySound(\'snd/tick.mp3\');">Import configuration</a></div>' + 
						writeHeader("Hotkeys") + '<div class="listing"><a class="option" ' + Game.clickStr + '="KlattmoseUtilities.EditHotkey(' + KlattmoseUtilities.config.hotkeys.length + '); PlaySound(\'snd/tick.mp3\');">Add</a></div>' + 
						'<div class="listing"><p>Single fire</p></div>';
			
			var repStr = '<div class="listing"><p>Repeaters</p></div>';
			
			for(var i = 0; i < KlattmoseUtilities.config.hotkeys.length; i++){
				var hotkey = KlattmoseUtilities.config.hotkeys[i];
				
				if(hotkey.period === undefined){
					str += '<div class="listing">' + 
						'<a class="option" ' + Game.clickStr + '="KlattmoseUtilities.EditHotkey(' + i + '); PlaySound(\'snd/tick.mp3\');">Edit</a>' + 
						'<a class="option" ' + Game.clickStr + '="KlattmoseUtilities.config.hotkeys.splice(' + i + ', 1); PlaySound(\'snd/tick.mp3\'); Game.UpdateMenu();">Remove</a>' + 
						'<label>(' + KlattmoseUtilities.getKeybindString(hotkey) + ')    ' + (((hotkey.nickname === undefined) || (hotkey.nickname.length == 0)) ? ('Hotkey ' + i) : hotkey.nickname) + '</label>' + 
						'</div>';
				} else {
					repStr += '<div class="listing">' + 
						'<a class="option" ' + Game.clickStr + '="KlattmoseUtilities.EditHotkey(' + i + '); PlaySound(\'snd/tick.mp3\');">Edit</a>' + 
						'<a class="option" ' + Game.clickStr + '="KlattmoseUtilities.config.hotkeys.splice(' + i + ', 1); PlaySound(\'snd/tick.mp3\'); Game.UpdateMenu();">Remove</a>' + 
						'<label>(' + KlattmoseUtilities.getKeybindString(hotkey) + ')    ' + (((hotkey.nickname === undefined) || (hotkey.nickname.length == 0)) ? ('Hotkey ' + i) : hotkey.nickname) + '</label>' + 
						'</div>';
				}
			}
			str += repStr;
			
			str += writeHeader("Optional Patches");
			
			str += '<div class="listing">' + WriteButton('slotGodFix', 'slotGodFixButton', 'Pantheon Swap fix ON', 'Pantheon Swap fix OFF', '') + '<label>There\'s a small bug in the Pantheon minigame that sometimes assigns a god to slot -1. This only causes problems if you use a hotkey or the console to perform a soft-reload.</label></div>';
			str += '<div class="listing">' + WriteButton('gamblersFeverDreamFix', 'gamblersFeverDreamFixButton', "Gambler\'s Fever Dream fix ON", "Gambler\'s Fever Dream fix OFF", '') + '<label>This makes the spell Gambler\'s Fever Dream act according to it\'s in-game description.</label></div>';
			
			
			
			var div = document.createElement('div');
			div.innerHTML = str;
			var menu = document.getElementById('menu');
			if(menu) {
				menu = menu.getElementsByClassName('subsection')[0];
				if(menu) {
					var padding = menu.getElementsByTagName('div');
					padding = padding[padding.length - 1];
					if(padding) {
						menu.insertBefore(div, padding);
					} else {
						menu.appendChild(div);
					}
				}
			}
		}
	}
	
	AddEvent(window, 'keydown', function(e){
		if(KlattmoseUtilities.waitingForInput){
			KlattmoseUtilities.tempHotkey.ctrl = e.ctrlKey;
			KlattmoseUtilities.tempHotkey.shift = e.shiftKey;
			KlattmoseUtilities.tempHotkey.alt = e.altKey;
			KlattmoseUtilities.tempHotkey.keyCode = e.keyCode;
			
			var temp = KlattmoseUtilities.getKeybindString(KlattmoseUtilities.tempHotkey);
			
			l('keybindEditor').innerHTML = ((temp.length > 0) ? temp : '...');
			if(KlattmoseUtilities.validateInput(e.keyCode).length > 0){
				KlattmoseUtilities.waitingForInput = 0;
			}
			
		} else if (!Game.OnAscend && Game.AscendTimer == 0) {
			for(var i = 0; i < KlattmoseUtilities.config.hotkeys.length; i++){
				var hotkey = KlattmoseUtilities.config.hotkeys[i];
				if((e.ctrlKey == hotkey.ctrl) && (e.shiftKey == hotkey.shift) && (e.altKey == hotkey.alt) && (e.keyCode == hotkey.keyCode))
				{
					if(hotkey.period === undefined){
						eval(hotkey.script);
					}else{
						var script = hotkey.script;
						if(KlattmoseUtilities.RepeaterFlags[hotkey.nickname] === undefined || KlattmoseUtilities.RepeaterFlags[hotkey.nickname] == false){
							KlattmoseUtilities.Repeaters[hotkey.nickname] = setInterval(function(){ eval(script) }, hotkey.period);
							KlattmoseUtilities.RepeaterFlags[hotkey.nickname] = true;
							Game.Notify(hotkey.nickname + ' Active!', '', '', 1, 1);
						} else {
							clearInterval(KlattmoseUtilities.Repeaters[hotkey.nickname]);
							KlattmoseUtilities.RepeaterFlags[hotkey.nickname] = false;
							Game.Notify(hotkey.nickname + ' Off', '', '', 1, 1);
						}
					}
				}
			}
		}
		
	});
	
	AddEvent(window, 'keyup', function(e){
		if(KlattmoseUtilities.waitingForInput){
			KlattmoseUtilities.tempHotkey.ctrl = e.ctrlKey;
			KlattmoseUtilities.tempHotkey.shift = e.shiftKey;
			KlattmoseUtilities.tempHotkey.alt = e.altKey;
			KlattmoseUtilities.tempHotkey.keyCode = e.keyCode;
			
			var temp = KlattmoseUtilities.getKeybindString(KlattmoseUtilities.tempHotkey);
			
			l('keybindEditor').innerHTML = ((temp.length > 0) ? temp : '...');
		}
	});
	
	if (Game.prefs.popups) Game.Popup('Klattmose Utilities loaded!');
	else Game.Notify('Klattmose Utilities loaded!', '', '', 1, 1);
}


//***********************************
//    Configuration
//***********************************
KlattmoseUtilities.saveConfig = function(config){
	localStorage.setItem(KlattmoseUtilities.ConfigPrefix, JSON.stringify(config));
}

KlattmoseUtilities.loadConfig = function(){
	if (localStorage.getItem(KlattmoseUtilities.ConfigPrefix) != null) {
		KlattmoseUtilities.config = JSON.parse(localStorage.getItem(KlattmoseUtilities.ConfigPrefix));
	}
}

KlattmoseUtilities.restoreDefaultConfig = function(mode){
	KlattmoseUtilities.config = KlattmoseUtilities.defaultConfig();
	if(mode == 2) KlattmoseUtilities.saveConfig(KlattmoseUtilities.config);
}


//***********************************
//    Hotkey Functions
//***********************************
KlattmoseUtilities.EditHotkey = function(i){
	if(i < KlattmoseUtilities.config.hotkeys.length){
		KlattmoseUtilities.tempHotkey = JSON.parse(JSON.stringify(KlattmoseUtilities.config.hotkeys[i]));
	} else {
		KlattmoseUtilities.tempHotkey = {keyCode:0, nickname:'New hotkey', ctrl:false, shift:false, alt:false, script:''};
	}
	
	var hotkey = KlattmoseUtilities.tempHotkey;
	
	var str = '<h3>Edit Hotkey</h3><div class="block" style="overflow: auto;">';
	str += '<div class="listing" style="float: left;">Nickname: <input id="nicknameEditor" class="option" type="text" value="' + hotkey.nickname + '" style="width: 125px;"></div><br/>';
	str += '<div class="listing" style="float: left;">Key Binding: <a id="keybindEditor" class="option" ' + Game.clickStr + '="KlattmoseUtilities.getNewKeybinding(' + i + ');" >' + (i==KlattmoseUtilities.config.hotkeys.length?'(Click)':KlattmoseUtilities.getKeybindString(hotkey)) + '</a></div></div>';
	str += '<div class="listing" style="float: left;">Period (ms): <input id="periodEditor" class="option" type="text" value="' + (hotkey.period === undefined ? '' : hotkey.period) + '" style="width: 125px;"></div><br/>';
	str += '<div class="block"><div class="listing" style="float: left;">Script:</div><br/>';
	str += '<div><textarea id="textareaPrompt" style="width:100%;height:128px;">';
	str += hotkey.script;
	str += '</textarea></div></div>';
	
	Game.Prompt(str, [['Save', 'KlattmoseUtilities.saveNewKeybinding(' + i + '); Game.ClosePrompt(); Game.UpdateMenu();'], 
					  ['Nevermind', 'KlattmoseUtilities.waitingForInput = 0; Game.ClosePrompt();']]);
}

KlattmoseUtilities.getNewKeybinding = function(i){
	var hotkey = KlattmoseUtilities.config.hotkeys[i];
	l('keybindEditor').innerHTML = '...';
	KlattmoseUtilities.waitingForInput = 1;
}

KlattmoseUtilities.saveNewKeybinding = function(i){
	KlattmoseUtilities.waitingForInput = 0;
	if(KlattmoseUtilities.validateInput(KlattmoseUtilities.tempHotkey.keyCode).length == 0) return;
	
	KlattmoseUtilities.tempHotkey.nickname = l('nicknameEditor').value;
	KlattmoseUtilities.tempHotkey.period = l('periodEditor').value;
	if(isNaN(KlattmoseUtilities.tempHotkey.period) || KlattmoseUtilities.tempHotkey.period.length == 0) delete KlattmoseUtilities.tempHotkey.period;
	KlattmoseUtilities.tempHotkey.script = l('textareaPrompt').value;
	KlattmoseUtilities.config.hotkeys[i] = KlattmoseUtilities.tempHotkey;
	KlattmoseUtilities.saveConfig(KlattmoseUtilities.config);
}

KlattmoseUtilities.exportConfig = function(){
	Game.prefs.showBackupWarning = 0;
	Game.Prompt('<h3>Export configuration</h3><div class="block">This is your current configuration.<br>In a nice and readable format!</div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;" readonly>' + 
				JSON.stringify(KlattmoseUtilities.config, null, 2) + 
				'</textarea></div>',['All done!']);
	l('textareaPrompt').focus();
	l('textareaPrompt').select();
}

KlattmoseUtilities.importConfig = function(){
	Game.Prompt('<h3>Import config</h3><div class="block">Paste your configuration string here.</div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;"></textarea></div>',
				[['Load','if (l(\'textareaPrompt\').value.length > 0) {KlattmoseUtilities.config = JSON.parse(l(\'textareaPrompt\').value); Game.ClosePrompt(); Game.UpdateMenu();}'], 'Nevermind']);
	l('textareaPrompt').focus();
}

KlattmoseUtilities.getKeybindString = function(hotkey){
	var res = '';
	res += hotkey.ctrl?'Ctrl+':'';
	res += hotkey.shift?'Shift+':'';
	res += hotkey.alt?'Alt+':'';
	
	return res + KlattmoseUtilities.validateInput(hotkey.keyCode);
}

KlattmoseUtilities.validateInput = function(keyCode){
	if((keyCode > 47 && keyCode < 58) || (keyCode > 64 && keyCode < 91)) return String.fromCharCode(keyCode);
	if(keyCode > 95 && keyCode < 106) return 'Num ' + (keyCode - 96);
	if(keyCode > 111 && keyCode < 124) return 'F' + (keyCode - 111);
	return '';
}


//***********************************
//    Optional Patches
//***********************************
KlattmoseUtilities.patches = {};

KlattmoseUtilities.patches.Toggle = function(patchName, button, on, off, invert){
	if (KlattmoseUtilities.config.patches[patchName]){
		l(button).innerHTML = off;
		KlattmoseUtilities.config.patches[patchName] = 0;
	}else{
		l(button).innerHTML = on;
		KlattmoseUtilities.config.patches[patchName] = 1;
	}
	
	l(button).className = 'option' + ((KlattmoseUtilities.config.patches[patchName]^invert) ? '' : ' off');
	KlattmoseUtilities.saveConfig(KlattmoseUtilities.config);
}


KlattmoseUtilities.ReplaceNativeGarden = function() {
	if (!KlattmoseUtilities.HasReplaceNativeGardenLaunch && Game.Objects["Farm"].minigameLoaded) {
		var M = Game.Objects["Farm"].minigame;
		
		KlattmoseUtilities.HasReplaceNativeGardenLaunch = true;
	}
}

KlattmoseUtilities.ReplaceNativePantheon = function() {
	if (!KlattmoseUtilities.HasReplaceNativePantheonLaunch && Game.Objects["Temple"].minigameLoaded) {
		var M = Game.Objects["Temple"].minigame;
		
		KlattmoseUtilities.patches.slotGodFix = {};
		KlattmoseUtilities.patches.slotGodFix.oldFunction = M.slotGod;
		
		
		KlattmoseUtilities.patches.slotGodFix.newFunction = function(god, slot){
			if(slot == god.slot) return false;
			
			if(slot == -1) M.slot[god.slot] = -1;
			else if(M.slot[slot] != -1) M.godsById[M.slot[slot]].slot = god.slot;
			
			if(god.slot != -1 && slot != -1) M.slot[god.slot] = M.slot[slot];
			if(slot != -1) M.slot[slot] = god.id;
			
			god.slot = slot;
			Game.recalculateGains = true;
		}
		
		
		M.slotGod = function(god, slot){
			if(KlattmoseUtilities.config.patches.slotGodFix) KlattmoseUtilities.patches.slotGodFix.newFunction(god, slot);
			else KlattmoseUtilities.patches.slotGodFix.oldFunction(god, slot);
		}
		
		KlattmoseUtilities.HasReplaceNativePantheonLaunch = true;
	}
}

KlattmoseUtilities.ReplaceNativeGrimoire = function() {
	if (!KlattmoseUtilities.HasReplaceNativeGrimoireLaunch && Game.Objects["Wizard tower"].minigameLoaded) {
		var M = Game.Objects["Wizard tower"].minigame;
		
		KlattmoseUtilities.patches.gamblersFeverDreamFix = {};
		KlattmoseUtilities.patches.gamblersFeverDreamFix.oldFunction = M.spells['gambler\'s fever dream'].win;
		
		
		KlattmoseUtilities.patches.gamblersFeverDreamFix.newFunction = function(){
			var spells=[];
			var selfCost=M.getSpellCost(M.spells['gambler\'s fever dream']);
			for (var i in M.spells)
			{if (i!='gambler\'s fever dream' && (M.magic-selfCost)>=M.getSpellCost(M.spells[i])*0.5) spells.push(M.spells[i]);}
			if (spells.length==0){Game.Popup('<div style="font-size:80%;">No eligible spells!</div>',Game.mouseX,Game.mouseY);return -1;}
			var spell=choose(spells);
			var cost=M.getSpellCost(spell)*0.5;
			setTimeout(function(spell,cost,seed){return function(){
				if (Game.seed!=seed) return false;
				var out=M.castSpell(spell,{cost:cost,failChanceMult:2,passthrough:true});
				if (!out)
				{
					M.magic+=selfCost;
					setTimeout(function(){
						Game.Popup('<div style="font-size:80%;">That\'s too bad!<br>Magic refunded.</div>',Game.mouseX,Game.mouseY);
					},1500);
				}
			}}(spell,cost,Game.seed),1000);
			Game.Popup('<div style="font-size:80%;">Casting '+spell.name+'<br>for '+Beautify(cost)+' magic...</div>',Game.mouseX,Game.mouseY);
		}
		
		
		M.spells['gambler\'s fever dream'].win = function(){
			if(KlattmoseUtilities.config.patches.gamblersFeverDreamFix) KlattmoseUtilities.patches.gamblersFeverDreamFix.newFunction();
			else KlattmoseUtilities.patches.gamblersFeverDreamFix.oldFunction();
		}
		
		KlattmoseUtilities.HasReplaceNativeGrimoireLaunch = true;
	}
}






if(KlattmoseUtilities.toLoad) KlattmoseUtilities.init();