Game.Win('Third-party');
if (KlattmoseUtilities === undefined) {
	var KlattmoseUtilities = {};
	
	KlattmoseUtilities.saveConfig = function(config){
		localStorage.setItem(KlattmoseUtilities.ConfigPrefix, JSON.stringify(config));
	}
	
	KlattmoseUtilities.loadConfig = function(){
		if (localStorage.getItem(KlattmoseUtilities.ConfigPrefix) != null) {
			KlattmoseUtilities.config = JSON.parse(localStorage.getItem(KlattmoseUtilities.ConfigPrefix));
		}
	}
	
	KlattmoseUtilities.restoreDefaultConfig = function(mode){
		KlattmoseUtilities.config = {
		  "hotkeys": [
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
			  "script": "if(Game.Objects[\"Wizard tower\"].amount > 40){Game.Objects[\"Wizard tower\"].sell(Game.Objects[\"Wizard tower\"].amount - 40);}"
			},
			{
			  "keyCode": 52,
			  "nickname": "Toggle Autoclicker",
			  "ctrl": false,
			  "shift": false,
			  "alt": false,
			  "script": "if(KlattmoseUtilities.autoClickerActive === undefined || KlattmoseUtilities.autoClickerActive == false){\n\tKlattmoseUtilities.autoClicker = setInterval(Game.ClickCookie, 10);\n\tKlattmoseUtilities.autoClickerActive = true;\n\tGame.Notify('Autoclicker Active!', '', '', 1, 1);\n} else {\n\tclearInterval(KlattmoseUtilities.autoClicker);\n\tKlattmoseUtilities.autoClickerActive = false;\n\tGame.Notify('Autoclicker Off', '', '', 1, 1);\n}"
			},
			{
			  "keyCode": 53,
			  "nickname": "Toggle Golden Autoclicker",
			  "ctrl": false,
			  "shift": false,
			  "alt": false,
			  "script": "if(KlattmoseUtilities.autoGoldenClickerActive === undefined || KlattmoseUtilities.autoGoldenClickerActive == false){\n\tKlattmoseUtilities.autoGoldenClicker = setInterval(function() { Game.shimmers.forEach(function(shimmer) { if (shimmer.type == \"golden\" || shimmer.type == \"reindeer\") { shimmer.pop() } }) }, 500);\n\tKlattmoseUtilities.autoGoldenClickerActive = true;\n\tGame.Notify('Golden Autoclicker Active!', '', '', 1, 1);\n} else {\n\tclearInterval(KlattmoseUtilities.autoGoldenClicker);\n\tKlattmoseUtilities.autoGoldenClickerActive = false;\n\tGame.Notify('Golden Autoclicker Off', '', '', 1, 1);\n}"
			},
			{
			  "keyCode": 54,
			  "nickname": "Sugar Lump Appraisal",
			  "ctrl": false,
			  "shift": false,
			  "alt": false,
			  "script": "var temp = Game.lumpCurrentType;\nif (temp == 0) temp = 'normal';\nelse if (temp == 1) temp = 'bifurcated';\nelse if (temp == 2) temp = 'golden';\nelse if (temp == 3) temp = 'meaty';\nelse if (temp == 4) temp = 'caramelized';\nGame.Notify('A ' + temp + ' sugar lump is growing!', '', '', 1, 1);"
			}
		  ]
		}
		if(mode == 2) KlattmoseUtilities.saveConfig(KlattmoseUtilities.config);
	}
	
	KlattmoseUtilities.restoreDefaultConfig(1);
	KlattmoseUtilities.ConfigPrefix = "KlattmoseUtilities";
	KlattmoseUtilities.waitingForInput = 0;
	
	KlattmoseUtilities.loadConfig();
	
	KlattmoseUtilities.oldUpdateMenu = Game.UpdateMenu;
	Game.UpdateMenu = function(){
		KlattmoseUtilities.oldUpdateMenu();
		if(Game.onMenu === 'prefs') {
			var str =	'<div class="title">Klattmose Utilities</div>' + 
						'<div class="listing"><a class="option" ' + Game.clickStr + '="KlattmoseUtilities.restoreDefaultConfig(2); PlaySound(\'snd/tick.mp3\'); Game.UpdateMenu();">Restore Default</a></div>' + 
						'<div class="listing"><a class="option" ' + Game.clickStr + '="KlattmoseUtilities.exportConfig(); PlaySound(\'snd/tick.mp3\');">Export configuration</a>' +
											 '<a class="option" ' + Game.clickStr + '="KlattmoseUtilities.importConfig(); PlaySound(\'snd/tick.mp3\');">Import configuration</a></div>';
			
			
			for(var i = 0; i < KlattmoseUtilities.config.hotkeys.length; i++){
				var hotkey = KlattmoseUtilities.config.hotkeys[i];
				str +=	'<div class="listing">' + 
						'<a class="option" ' + Game.clickStr + '="KlattmoseUtilities.EditHotkey(' + i + '); PlaySound(\'snd/tick.mp3\');">Edit</a>' + 
						'<a class="option" ' + Game.clickStr + '="KlattmoseUtilities.config.hotkeys.splice(' + i + ', 1); PlaySound(\'snd/tick.mp3\'); Game.UpdateMenu();">Remove</a>' + 
						'<label>(' + KlattmoseUtilities.getKeybindString(hotkey) + ')    ' + (((hotkey.nickname === undefined) || (hotkey.nickname.length == 0)) ? ('Hotkey ' + i) : hotkey.nickname) + '</label>' + 
						'</div>';
			}
			
			str += '<div class="listing"><a class="option" ' + Game.clickStr + '="KlattmoseUtilities.EditHotkey(' + KlattmoseUtilities.config.hotkeys.length + '); PlaySound(\'snd/tick.mp3\');">Add</a></div>'
			
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
		if (!Game.OnAscend && Game.AscendTimer == 0)
		{
			for(var i = 0; i < KlattmoseUtilities.config.hotkeys.length; i++){
				var hotkey = KlattmoseUtilities.config.hotkeys[i];
				if((e.ctrlKey == hotkey.ctrl) && (e.shiftKey == hotkey.shift) && (e.altKey == hotkey.alt) && (e.keyCode == hotkey.keyCode))
				{
					eval(hotkey.script);
				}
			}
		}
		
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
				[['Load','if (l(\'textareaPrompt\').value.length > 0) {KlattmoseUtilities.config = JSON.parse(l(\'textareaPrompt\').value); Game.ClosePrompt();}'], 'Nevermind']);
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