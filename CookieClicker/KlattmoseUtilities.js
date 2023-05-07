Game.Win('Third-party');
if(KlattmoseUtilities === undefined) var KlattmoseUtilities = {};
if(KlattmoseUtilities.patches === undefined) KlattmoseUtilities.patches = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (0 ? 'Beta/' : '') + 'CCSE.js');
KlattmoseUtilities.name = 'Klattmose Utilities';
KlattmoseUtilities.version = '2.16';
KlattmoseUtilities.GameVersion = '2.052';

KlattmoseUtilities.launch = function(){
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
			  "script": "var amt = Game.Objects[\"Mine\"].amount;\nGame.Objects[\"Mine\"].sell(amt); \nGame.Objects[\"Mine\"].buy(amt);"
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
			  "keyCode": 53,
			  "nickname": "Export Save",
			  "ctrl": false,
			  "shift": false,
			  "alt": false,
			  "script": "Game.ExportSave();\ndocument.execCommand('copy');\nGame.ClosePrompt();\nGame.Notify('Saved to clipboard', '', '', 1, 1);"
			},
			{
			  "keyCode": 97,
			  "nickname": "Autoclicker",
			  "ctrl": false,
			  "shift": false,
			  "alt": false,
			  "period": "10",
			  "script": "Game.lastClick=0;\nGame.ClickCookie();"
			},
			{
			  "keyCode": 98,
			  "nickname": "Golden Autoclicker",
			  "ctrl": false,
			  "shift": false,
			  "alt": false,
			  "period": "500",
			  "script": "Game.shimmers.forEach(function(shimmer){shimmer.pop()})"
			},
			{
			  "keyCode": 99,
			  "nickname": "Wrinkler Harvest",
			  "ctrl": false,
			  "shift": false,
			  "alt": false,
			  "period": "60000",
			  "script": "Game.CollectWrinklers();"
			},
			{
			  "keyCode": 100,
			  "nickname": "Autospell",
			  "ctrl": false,
			  "shift": false,
			  "alt": false,
			  "script": "var M = Game.Objects[\"Wizard tower\"].minigame;\nif(M && M.magic == M.magicM) M.castSpell(M.spells[\"haggler's charm\"]);",
			  "period": "1000"
			},
			{
			  "keyCode": 101,
			  "nickname": "Cookie Monster Autobuy",
			  "ctrl": false,
			  "shift": false,
			  "alt": false,
			  "script": "if(typeof CookieMonsterData == 'undefined'){}\nelse{\n\tvar waitForUpgrade = false;\n\tfor (var i in CookieMonsterData['Upgrades']) {\n\t\tvar obj = Game.Upgrades[i];\n\t\tif((CookieMonsterData['Upgrades'][i].colour == 'Green' || CookieMonsterData['Upgrades'][i].colour == 'Blue') && obj.pool != \"toggle\" && !obj.isVaulted()){\n\t\t\tif(obj.getPrice() < Game.cookies) {\n\t\t\t\tobj.buy();\n\t\t\t\tGame.Notify('Bought ' + obj.name, '', '', 1, 1);\n\t\t\t\twaitForUpgrade = false;\n\t\t\t}else{\n\t\t\t\twaitForUpgrade = true;\n\t\t\t}\n\t\t}\n\t}\n\tif(!waitForUpgrade){\n\t\tfor (var i in CookieMonsterData['Objects1']) {\n\t\t\tvar obj = Game.Objects[i];\n\t\t\tif(CookieMonsterData['Objects1'][i].colour == 'Green' && obj.price < Game.cookies){\n\t\t\t\tobj.buy(1);\n\t\t\t\tGame.Notify('Bought a ' + obj.name, '', '', 1, 1);\n\t\t\t}\n\t\t}\n\t}\n}",
			  "period": "100"
			},
			{
			  "keyCode": 102,
			  "nickname": "Ticker Autoclicker",
			  "ctrl": false,
			  "shift": false,
			  "alt": false,
			  "script": "if(Game.TickerEffect != 0) Game.tickerL.click();",
			  "period": "5000"
			}
		  ],
		  "patches": {
			"gardenOrderofOperations": 0,
			"slotGodFix": 0,
			"gamblersFeverDreamFix": 0
		  },
		  "onLoadFunctions": []
		}
	}

	KlattmoseUtilities.init = function(){
		KlattmoseUtilities.isLoaded = 1;
		KlattmoseUtilities.Backup = {};
		KlattmoseUtilities.Repeaters = {};
		KlattmoseUtilities.RepeaterFlags = {};
		KlattmoseUtilities.ConfigPrefix = "KlattmoseUtilities";
		KlattmoseUtilities.waitingForInput = 0;
		KlattmoseUtilities.OnloadFunctionsRan = 0;
		
		KlattmoseUtilities.restoreDefaultConfig(1);
		if(localStorage[KlattmoseUtilities.ConfigPrefix] && !Game.modSaveData[KlattmoseUtilities.name]) KlattmoseUtilities.TransferSave();
		
		
		KlattmoseUtilities.ReplaceNativeGarden();
		KlattmoseUtilities.ReplaceNativePantheon();
		KlattmoseUtilities.ReplaceNativeGrimoire();
		KlattmoseUtilities.ReplaceGameMenu();
		
		
		//***********************************
		//    Add the events to detect hotkey presses
		//***********************************
		AddEvent(window, 'keydown', KlattmoseUtilities.keydown);
		AddEvent(window, 'keyup', KlattmoseUtilities.keyup);
		
		
		//***********************************
		//    Post-Load Hooks 
		//    To support other mods interfacing with this one
		//***********************************
		if(KlattmoseUtilities.postloadHooks) {
			for(var i = 0; i < KlattmoseUtilities.postloadHooks.length; ++i) {
				KlattmoseUtilities.postloadHooks[i]();
			}
		}
		
		
		if (Game.prefs.popups) Game.Popup('Klattmose Utilities loaded!');
		else Game.Notify('Klattmose Utilities loaded!', '', '', 1, 1);
	}


	//***********************************
	//    Menu Replacer
	//***********************************
	KlattmoseUtilities.ReplaceGameMenu = function(){
		Game.customOptionsMenu.push(function(){
			CCSE.AppendCollapsibleOptionsMenu(KlattmoseUtilities.name, KlattmoseUtilities.getMenuString());
		});
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(KlattmoseUtilities.name, KlattmoseUtilities.version);
		});
	}

	KlattmoseUtilities.getMenuString = function(){
		let m = CCSE.MenuHelper;
		
		var str =	'<div class="listing">' + m.ActionButton("KlattmoseUtilities.restoreDefaultConfig(2); Game.UpdateMenu();", 'Restore Default') + '</div>' + 
					'<div class="listing">' + m.ActionButton("KlattmoseUtilities.exportConfig();", 'Export configuration') +
										 m.ActionButton("KlattmoseUtilities.importConfig();", 'Import configuration') + '</div>' + 
					m.Header("Hotkeys") + '<div class="listing">' + m.ActionButton("KlattmoseUtilities.EditHotkey(" + KlattmoseUtilities.config.hotkeys.length + ");", 'Add') + '</div>' + 
					'<div class="listing"><p>Single fire</p></div>';
		
		var repStr = '<div class="listing"><p>Repeaters</p></div>';
		
		for(var i = 0; i < KlattmoseUtilities.config.hotkeys.length; i++){
			var hotkey = KlattmoseUtilities.config.hotkeys[i];
			
			if(hotkey.period === undefined){
				str += '<div class="listing">' + 
					m.ActionButton("KlattmoseUtilities.EditHotkey(" + i + ");", 'Edit') + 
					m.ActionButton("KlattmoseUtilities.config.hotkeys.splice(" + i + ", 1); Game.UpdateMenu();", 'Remove') + 
					'<label>(' + KlattmoseUtilities.getKeybindString(hotkey) + ')    ' + (((hotkey.nickname === undefined) || (hotkey.nickname.length == 0)) ? ('Hotkey ' + i) : hotkey.nickname) + '</label>' + 
					'</div>';
			} else {
				repStr += '<div class="listing">' + 
					m.ActionButton("KlattmoseUtilities.EditHotkey(" + i + ");", 'Edit') + 
					m.ActionButton("KlattmoseUtilities.config.hotkeys.splice(" + i + ", 1); Game.UpdateMenu();", 'Remove') + 
					'<label>(' + KlattmoseUtilities.getKeybindString(hotkey) + ')    ' + (((hotkey.nickname === undefined) || (hotkey.nickname.length == 0)) ? ('Hotkey ' + i) : hotkey.nickname) + '</label>' + 
					'</div>';
			}
		}
		str += repStr;
		
		
		str += m.Header("On-Load Functions") + '<div class="listing">' + m.ActionButton("KlattmoseUtilities.EditOnLoadFunction(" + KlattmoseUtilities.config.onLoadFunctions.length + ");", 'Add') + '</div>';
		for(var i = 0; i < KlattmoseUtilities.config.onLoadFunctions.length; i++){
			var onLoadFunction = KlattmoseUtilities.config.onLoadFunctions[i];
			
			str += '<div class="listing">' + 
				m.ActionButton("KlattmoseUtilities.EditOnLoadFunction(" + i + ");", 'Edit') + 
				m.ActionButton("KlattmoseUtilities.config.onLoadFunctions.splice(" + i + ", 1); Game.UpdateMenu();", 'Remove') + 
				'<label>' + (((onLoadFunction.nickname === undefined) || (onLoadFunction.nickname.length == 0)) ? ('On-Load Function ' + i) : onLoadFunction.nickname) + '</label>' + 
				'</div>';
		}
		
		
		str += m.Header("Optional Patches");
		
		str += '<div class="listing">' + m.ToggleButton(KlattmoseUtilities.config.patches, 'gardenOrderofOperations', 'gardenOrderofOperationsButton', 'Garden Order of Operations ON', 'Garden Order of Operations OFF', 'KlattmoseUtilities.patches.Toggle') + '<label>Makes it so the garden calculates the age of all the plants first, then the spread/mutation.</label></div>';
		str += '<div class="listing">' + m.ToggleButton(KlattmoseUtilities.config.patches, 'slotGodFix', 'slotGodFixButton', 'Pantheon Swap fix ON', 'Pantheon Swap fix OFF', 'KlattmoseUtilities.patches.Toggle') + '<label>There\'s a small bug in the Pantheon minigame that sometimes assigns a god to slot -1. This only causes problems if you use a hotkey or the console to perform a soft-reload.</label></div>';
		str += '<div class="listing">' + m.ToggleButton(KlattmoseUtilities.config.patches, 'gamblersFeverDreamFix', 'gamblersFeverDreamFixButton', "Gambler\'s Fever Dream fix ON", "Gambler\'s Fever Dream fix OFF", 'KlattmoseUtilities.patches.Toggle') + '<label>This makes the spell Gambler\'s Fever Dream act according to it\'s in-game description.</label></div>';
		
		
		return str;
	}


	//***********************************
	//    Configuration
	//***********************************
	KlattmoseUtilities.save = function(){
		KlattmoseUtilities.functionalize();
		return JSON.stringify(KlattmoseUtilities.config);
	}
	
	KlattmoseUtilities.load = function(data){
		KlattmoseUtilities.config = JSON.parse(data);
		KlattmoseUtilities.functionalize();
		
		if(!KlattmoseUtilities.OnloadFunctionsRan){
			//***********************************
			//    On-Load Functions run now
			//***********************************
			for(var i = 0; i < KlattmoseUtilities.config.onLoadFunctions.length; i++){
				KlattmoseUtilities.config.onLoadFunctions[i].function();
			}
			
			KlattmoseUtilities.OnloadFunctionsRan = 1;
		}
	}

	KlattmoseUtilities.restoreDefaultConfig = function(mode){
		KlattmoseUtilities.config = KlattmoseUtilities.defaultConfig();
		KlattmoseUtilities.functionalize();
		if(mode == 2) Game.WriteSave();
	}
	
	KlattmoseUtilities.TransferSave = function(){
		Game.modSaveData[KlattmoseUtilities.name] = localStorage.getItem(KlattmoseUtilities.ConfigPrefix);
		localStorage.removeItem(KlattmoseUtilities.ConfigPrefix);
	}

	KlattmoseUtilities.exportConfig = function(){
		Game.Prompt('<h3>Export configuration</h3><div class="block">This is your current configuration.<br>In a nice and readable format!</div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;" readonly>' + 
					JSON.stringify(KlattmoseUtilities.config, null, 2) + 
					'</textarea></div>',['All done!']);
		l('textareaPrompt').focus();
		l('textareaPrompt').select();
	}

	KlattmoseUtilities.importConfig = function(){
		Game.Prompt('<h3>Import config</h3><div class="block">Paste your configuration string here.</div><div class="block"><textarea id="textareaPrompt" style="width:100%;height:128px;"></textarea></div>',
					[['Load','if (l(\'textareaPrompt\').value.length > 0) {KlattmoseUtilities.config = JSON.parse(l(\'textareaPrompt\').value); Game.ClosePrompt(); KlattmoseUtilities.functionalize(); Game.UpdateMenu();}'], 'Nevermind']);
		l('textareaPrompt').focus();
	}

	KlattmoseUtilities.functionalize = function(){
		// In case any of these are left out
		if(KlattmoseUtilities.config.hotkeys === undefined) KlattmoseUtilities.config.hotkeys = {};
		if(KlattmoseUtilities.config.patches === undefined) KlattmoseUtilities.config.patches = {};
		if(KlattmoseUtilities.config.onLoadFunctions === undefined) KlattmoseUtilities.config.onLoadFunctions = {};
		
		for(var i = 0; i < KlattmoseUtilities.config.hotkeys.length; i++){
			try{
				eval("KlattmoseUtilities.config.hotkeys[" + i + "].function = function(){\n" + KlattmoseUtilities.config.hotkeys[i].script + "\n}");
			}catch{
				console.log('Failed to create function for ' + KlattmoseUtilities.config.hotkeys[i].nickname);
				KlattmoseUtilities.config.hotkeys[i].script = '';
			}
			
		}
		for(var i = 0; i < KlattmoseUtilities.config.onLoadFunctions.length; i++){
			try{
				eval("KlattmoseUtilities.config.onLoadFunctions[" + i + "].function = function(){\n" + KlattmoseUtilities.config.onLoadFunctions[i].script + "\n}");
			}catch{
				console.log('Failed to create function for ' + KlattmoseUtilities.config.onLoadFunctions[i].nickname);
				KlattmoseUtilities.config.onLoadFunctions[i].script = '';
			}
		}
	}


	//***********************************
	//    On-Load Function Functions
	//***********************************
	KlattmoseUtilities.EditOnLoadFunction = function(i){
		if(i < KlattmoseUtilities.config.onLoadFunctions.length){
			KlattmoseUtilities.tempOnLoadFunction = JSON.parse(JSON.stringify(KlattmoseUtilities.config.onLoadFunctions[i]));
		} else {
			KlattmoseUtilities.tempOnLoadFunction = {nickname:'New On-Load Function', script:''};
		}
		
		var onLoadFunction = KlattmoseUtilities.tempOnLoadFunction;
		
		var str = '<h3>Edit On-Load Function</h3><div class="block" style="overflow: auto;">';
		str += '<table style="width:80%;">';
		str += '<tr><td style="text-align:right; width:45%;">Nickname:</td><td style="width:5%;"></td><td style="text-align:left; width:50%;"><input id="nicknameEditor" class="option" type="text" value="' + onLoadFunction.nickname + '" style="width: 200px;" /></td></tr>';
		str += '</table></div>'
		str += '<div class="block"><div class="listing" style="float: left;">Script:</div><br/>';
		str += '<div><textarea id="textareaPrompt" style="width:100%;height:200px;">';
		str += onLoadFunction.script;
		str += '</textarea></div></div>';
		
		Game.Prompt(str, [['Save', 'KlattmoseUtilities.saveNewOnLoadFunction(' + i + '); Game.ClosePrompt(); Game.UpdateMenu();'], 
						  ['Nevermind', 'Game.ClosePrompt();']], 0, 'widePrompt');
	}

	KlattmoseUtilities.saveNewOnLoadFunction = function(i){
		KlattmoseUtilities.tempOnLoadFunction.nickname = l('nicknameEditor').value;
		KlattmoseUtilities.tempOnLoadFunction.script = l('textareaPrompt').value;
		KlattmoseUtilities.config.onLoadFunctions[i] = KlattmoseUtilities.tempOnLoadFunction;
		KlattmoseUtilities.functionalize();
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
		str += '<table style="width:80%;">';
		str += '<tr><td style="text-align:right; width:45%;">Nickname:</td><td style="width:5%;"></td><td style="text-align:left; width:50%;"><input id="nicknameEditor" class="option" type="text" value="' + hotkey.nickname + '" style="width: 200px;" /></td></tr>';
		str += '<tr><td style="text-align:right;">Key Binding:</td><td></td><td style="text-align:left;"><a id="keybindEditor" class="option" ' + Game.clickStr + '="KlattmoseUtilities.getNewKeybinding(' + i + ');" >' + (i==KlattmoseUtilities.config.hotkeys.length?'(Click)':KlattmoseUtilities.getKeybindString(hotkey)) + '</a></td></tr>';
		str += '<tr><td style="text-align:right;">Period (ms):</td><td></td><td style="text-align:left;"><input id="periodEditor" class="option" type="text" value="' + (hotkey.period === undefined ? '' : hotkey.period) + '" style="width: 50px;" /></td></tr>';
		str += '</table></div>'
		str += '<div class="block"><div class="listing" style="float: left;">Script:</div><br/>';
		str += '<div><textarea id="textareaPrompt" style="width:100%;height:200px;">';
		str += hotkey.script;
		str += '</textarea></div></div>';
		
		Game.Prompt(str, [['Save', 'KlattmoseUtilities.saveNewKeybinding(' + i + '); Game.ClosePrompt(); Game.UpdateMenu();'], 
						  ['Nevermind', 'KlattmoseUtilities.waitingForInput = 0; Game.ClosePrompt();']], 0, 'widePrompt');
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
		KlattmoseUtilities.functionalize();
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

	KlattmoseUtilities.keydown = function(e){
		if(KlattmoseUtilities.waitingForInput){
			e.preventDefault();
			
			KlattmoseUtilities.tempHotkey.ctrl = e.ctrlKey;
			KlattmoseUtilities.tempHotkey.shift = e.shiftKey;
			KlattmoseUtilities.tempHotkey.alt = e.altKey;
			KlattmoseUtilities.tempHotkey.keyCode = e.keyCode;
			
			var temp = KlattmoseUtilities.getKeybindString(KlattmoseUtilities.tempHotkey);
			
			l('keybindEditor').innerHTML = ((temp.length > 0) ? temp : '...');
			if(KlattmoseUtilities.validateInput(e.keyCode).length > 0){
				KlattmoseUtilities.waitingForInput = 0;
			}
			
		} else if (!Game.OnAscend && Game.AscendTimer == 0 && !Game.promptOn && !(CCSE.collapseMenu[KlattmoseUtilities.name] && Game.onMenu == 'prefs')) {
			for(var i = 0; i < KlattmoseUtilities.config.hotkeys.length; i++){
				var hotkey = KlattmoseUtilities.config.hotkeys[i];
				if((e.ctrlKey == hotkey.ctrl) && (e.shiftKey == hotkey.shift) && (e.altKey == hotkey.alt) && (e.keyCode == hotkey.keyCode))
				{
					e.preventDefault();
					
					if(hotkey.period === undefined){
						hotkey.function();
					}else{
						//var script = hotkey.script;
						if(KlattmoseUtilities.RepeaterFlags[hotkey.nickname] === undefined || KlattmoseUtilities.RepeaterFlags[hotkey.nickname] == false){
							KlattmoseUtilities.Repeaters[hotkey.nickname] = setInterval(hotkey.function, hotkey.period);
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
		
	}

	KlattmoseUtilities.keyup = function(e){
		if(KlattmoseUtilities.waitingForInput){
			e.preventDefault();
			
			KlattmoseUtilities.tempHotkey.ctrl = e.ctrlKey;
			KlattmoseUtilities.tempHotkey.shift = e.shiftKey;
			KlattmoseUtilities.tempHotkey.alt = e.altKey;
			KlattmoseUtilities.tempHotkey.keyCode = e.keyCode;
			
			var temp = KlattmoseUtilities.getKeybindString(KlattmoseUtilities.tempHotkey);
			
			l('keybindEditor').innerHTML = ((temp.length > 0) ? temp : '...');
		}
	}


	//***********************************
	//    Optional Patches
	//***********************************
	KlattmoseUtilities.patches.Toggle = function(patchName, button, on, off, invert){
		if (KlattmoseUtilities.config.patches[patchName]){
			l(button).innerHTML = off;
			KlattmoseUtilities.config.patches[patchName] = 0;
		}else{
			l(button).innerHTML = on;
			KlattmoseUtilities.config.patches[patchName] = 1;
		}
		
		l(button).className = 'smallFancyButton prefButton option' + ((KlattmoseUtilities.config.patches[patchName]^invert) ? '' : ' off');
	}


	KlattmoseUtilities.ReplaceNativeGarden = function() {
		CCSE.MinigameReplacer(function(){
			var M = Game.Objects['Farm'].minigame;
			
			KlattmoseUtilities.patches.gardenOrderofOperations = {};
			KlattmoseUtilities.patches.gardenOrderofOperations.oldFunction = M.logic;
			
			
			KlattmoseUtilities.patches.gardenOrderofOperations.newFunction = function(){
				//run each frame
				var now=Date.now();
				
				if (!M.freeze)
				{
					M.nextStep=Math.min(M.nextStep,now+(M.stepT)*1000);
					if (now>=M.nextStep)
					{
						M.computeStepT();
						M.nextStep=now+M.stepT*1000;
						
						M.computeBoostPlot();
						M.computeMatures();
						
						var weedMult=M.soilsById[M.soil].weedMult;
				
						var dragonBoost=1+0.05*Game.auraMult('Supreme Intellect');
						
						var loops=1;
						if (M.soilsById[M.soil].key=='woodchips') loops=3;
						loops=randomFloor(loops*dragonBoost);
						loops*=M.loopsMult;
						M.loopsMult=1;
						
						for (var y=0;y<6;y++)
						{
							for (var x=0;x<6;x++)
							{
								if (M.isTileUnlocked(x,y))
								{
									var tile=M.plot[y][x];
									var me=M.plantsById[tile[0]-1];
									if (tile[0]>0)
									{
										//age
										tile[1]+=randomFloor((me.ageTick+me.ageTickR*Math.random())*M.plotBoost[y][x][0]*dragonBoost);
										tile[1]=Math.max(tile[1],0);
										if (me.immortal) tile[1]=Math.min(me.mature+1,tile[1]);
										else if (tile[1]>=100)
										{
											//die of old age
											M.plot[y][x]=[0,0];
											if (me.onDie) me.onDie(x,y);
											if (M.soilsById[M.soil].key=='pebbles' && Math.random()<0.35)
											{
												if (M.unlockSeed(me)) Game.Popup(loc("Unlocked %1 seed.",me.name),Game.mouseX,Game.mouseY);
											}
										}
										else if (!me.noContam)
										{
											//other plant contamination
											//only occurs in cardinal directions
											//immortal plants and plants with noContam are immune
											
											var list=[];
											for (var i in M.plantContam)
											{
												if (Math.random()<M.plantContam[i] && (!M.plants[i].weed || Math.random()<weedMult)) list.push(i);
											}
											var contam=choose(list);
											
											if (contam && me.key!=contam)
											{
												if ((!M.plants[contam].weed && !M.plants[contam].fungus) || Math.random()<M.plotBoost[y][x][2])
												{
													var any=0;
													var neighs={};//all surrounding plants
													var neighsM={};//all surrounding mature plants
													for (var i in M.plants){neighs[i]=0;}
													for (var i in M.plants){neighsM[i]=0;}
													var neigh=M.getTile(x,y-1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
													var neigh=M.getTile(x,y+1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
													var neigh=M.getTile(x-1,y);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
													var neigh=M.getTile(x+1,y);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
													
													if (neighsM[contam]>=1) M.plot[y][x]=[M.plants[contam].id+1,0];
												}
											}
										}
									}
								}
							}
						}
						for (var y=0;y<6;y++)
						{
							for (var x=0;x<6;x++)
							{
								if (M.isTileUnlocked(x,y))
								{
									var tile=M.plot[y][x];
									var me=M.plantsById[tile[0]-1];
									if (tile[0]>0){}
									else
									{
										//plant spreading and mutation
										//happens on all 8 tiles around this one
										for (var loop=0;loop<loops;loop++)
										{
											var any=0;
											var neighs={};//all surrounding plants
											var neighsM={};//all surrounding mature plants
											for (var i in M.plants){neighs[i]=0;}
											for (var i in M.plants){neighsM[i]=0;}
											var neigh=M.getTile(x,y-1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
											var neigh=M.getTile(x,y+1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
											var neigh=M.getTile(x-1,y);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
											var neigh=M.getTile(x+1,y);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
											var neigh=M.getTile(x-1,y-1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
											var neigh=M.getTile(x-1,y+1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
											var neigh=M.getTile(x+1,y-1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
											var neigh=M.getTile(x+1,y+1);if (neigh[0]>0){var age=neigh[1];neigh=M.plantsById[neigh[0]-1];any++;neighs[neigh.key]++;if (age>=neigh.mature){neighsM[neigh.key]++;}}
											if (any>0)
											{
												var muts=M.getMuts(neighs,neighsM);
												
												var list=[];
												for (var ii=0;ii<muts.length;ii++)
												{
													if (Math.random()<muts[ii][1] && (!M.plants[muts[ii][0]].weed || Math.random()<weedMult) && ((!M.plants[muts[ii][0]].weed && !M.plants[muts[ii][0]].fungus) || Math.random()<M.plotBoost[y][x][2])) list.push(muts[ii][0]);
												}
												if (list.length>0) M.plot[y][x]=[M.plants[choose(list)].id+1,0];
											}
											else if (loop==0)
											{
												//weeds in empty tiles (no other plants must be nearby)
												var chance=0.002*weedMult*M.plotBoost[y][x][2];
												if (Math.random()<chance) M.plot[y][x]=[M.plants['meddleweed'].id+1,0];
											}
										}
									}
								}
							}
						}
						M.toRebuild=true;
						M.toCompute=true;
					}
				}
				if (M.toRebuild) M.buildPlot();
				if (M.toCompute) M.computeEffs();
				
				if (Game.keys[27])//esc
				{
					if (M.seedSelected>-1) M.plantsById[M.seedSelected].l.classList.remove('on');
					M.seedSelected=-1;
				}
			}
			
			
			M.logic = function(){
				if(KlattmoseUtilities.config.patches.gardenOrderofOperations) KlattmoseUtilities.patches.gardenOrderofOperations.newFunction();
				else KlattmoseUtilities.patches.gardenOrderofOperations.oldFunction();
			}
			
			
			//***********************************
			//    Insert into Agronomicon
			//***********************************
			KlattmoseUtilities.patches.AgronomiconInjection();
		}, 'Farm');
		
	}

	KlattmoseUtilities.patches.AgronomiconInjection = function(){
		if(typeof AcharvaksAgronomicon == "undefined"){
			AcharvaksAgronomicon = {};
			AcharvaksAgronomicon.postloadHooks = [];
		}else{
			if(typeof AcharvaksAgronomicon.postloadHooks == "undefined") AcharvaksAgronomicon.postloadHooks = [];
		}
		var AgroPosition = AcharvaksAgronomicon.postloadHooks.length;
		
		AcharvaksAgronomicon.postloadHooks[AgroPosition] = function(Agronomicon){
			var M = Game.Objects["Farm"].minigame;
			var wrap = M.AcharvaksAgronomicon.wrapper;
			
			var calcProbAgingGT = function(N, ageTick, ageTickR, ageBoost) {
				if(N % 1 != 0) {
					throw "In calcProbAgingGT, N must be an integer, got " + N;
				}
				if(N <= 0) {
					return 1;
				}
				ageTick *= ageBoost;
				ageTickR *= ageBoost;
				var p1 = 0;
				var p2 = 0;
				var p3 = 0;
				if(ageTickR > 0) {
					// Probability that ageTick + ageTickR * Math.random() will be less than N - 1
					p1 = (N - 1 - ageTick) / ageTickR;
					p1 = Math.min(Math.max(p1, 0), 1);
					
					// Probability that ageTick + ageTickR * Math.random() will be greater than N
					p2 = (ageTickR - N + ageTick) / ageTickR;
					p2 = Math.min(Math.max(p2, 0), 1);
				} else {
					p1 = (ageTick < N - 1 ? 1 : 0);
					p2 = (ageTick >= N ? 1 : 0);
				}

				if(p1 + p2 < 1) {
					/*
					 * Probability that if ageTick + ageTickR * Math.random() is between N - 1 and N,
					 * it will be rounded to N. I hope my analysis of the probability disribution was
					 * correct.
					 */
					 var a = (ageTick < N - 1 ? 0 : ageTick % 1);
					 var b = (ageTick + ageTickR < N ? ageTickR % 1 : 1 - a);
					 p3 = (1 - p1 - p2) * (a + b / 2);
				}
				
				return p2 + p3;
			}
			
			
			wrap.calcPartMutationProbability = function(x, y, x_offset, y_offset, prior_prob, neighs, neighsM,
																	plantsNextTick, cant_change) {
				var plant_id = this.garden.plot[y + y_offset][x + x_offset][0] - 1;
				var plant = (plant_id >= 0 ? this.garden.plantsById[plant_id] : null);
				if(!KlattmoseUtilities.config.patches.gardenOrderofOperations && cant_change) {
					if(plant !== null) {
						var is_mature = this.garden.plot[y + y_offset][x + x_offset][1] >= plant.mature;
						++neighs[plant.key];
						if(is_mature) {
							++neighsM[plant.key];
						}
						this.callNextOffset(x, y, x_offset, y_offset, prior_prob, neighs, neighsM, plantsNextTick);
						--neighs[plant.key];
						if(is_mature) {
							--neighsM[plant.key];
						}
					} else {
						return this.callNextOffset(x, y, x_offset, y_offset, prior_prob, neighs, neighsM, plantsNextTick);
					}
				} else {
					var ts = this.tileStatus[y + y_offset][x + x_offset];
					for(var i = 0; i < this.plantKeys.length; ++i) {
						var key = this.plantKeys[i];
						var pnt = ts.plantsNextTick[key];
						if(!pnt.prevented) {
							if(pnt.probImmature > 0) {
								++neighs[key];
								this.callNextOffset(x, y, x_offset, y_offset, prior_prob * pnt.probImmature, neighs, neighsM, plantsNextTick);
								--neighs[key];
							}
							if(pnt.probMature > 0) {
								++neighs[key];
								++neighsM[key];
								this.callNextOffset(x, y, x_offset, y_offset, prior_prob * pnt.probMature, neighs, neighsM, plantsNextTick);
								--neighsM[key];
								--neighs[key];
							}
						}
					}
					if(ts.probEmptyNextTick > 0) {
						this.callNextOffset(x, y, x_offset, y_offset, prior_prob * ts.probEmptyNextTick, neighs, neighsM, plantsNextTick);
					}
				}
			}
			
			
			wrap.recalculateTileAge = function(x, y, loops) {
				var s = this.tileStatus[y][x];
				if(!this.garden.isTileUnlocked(x, y)) {
					if(s.unlocked) {
						// The tile somehow became locked
						s.plant = null;
						s.probGrowthNextTick = 0;
						s.probDeathNextTick = 0;
						s.probEmptyNextTick = 0;
						s.underEffects = false;
					}
				} else {
					s.unlocked = true;
					for(var key in s.plantsNextTick) {
						var ss = s.plantsNextTick[key];
						ss.probMature = 0;
						ss.probImmature = 0;
					}
					var tile = this.garden.plot[y][x];
					var tile_boost = this.garden.plotBoost[y][x];
					s.underEffects = (tile_boost[0] !== 1 || tile_boost[2] !== 1);
					if(tile[0] === 0) {
						s.plant = null;
						s.probGrowthNextTick = 0;
						s.probDeathNextTick = 0;
					} else {
						s.plant = this.garden.plantsById[tile[0]-1];
						s.probGrowthNextTick = calcProbAgingGT(1, s.plant.ageTick, s.plant.ageTickR, tile_boost[0]);
						s.probDeathNextTick = (s.plant.immortal ? 0 : calcProbAgingGT(100 - tile[1], s.plant.ageTick, s.plant.ageTickR, tile_boost[0]));
					}
					if(s.plant) {
						// Contamination
						var prob_contam = 0;
						var baseContamProbs = this.baseContamProbsBySoilId[this.garden.soil];
						if(s.probDeathNextTick < 1 && !s.plant.noContam) {
							var mcn = this.getMatureCardinalNeighbors(x, y);
							for(key in baseContamProbs) {
								if(baseContamProbs[key] && s.plant.key !== key && mcn[key]) {
									var newplant = this.garden.plants[key];
									var this_prob_contam = (1 - s.probDeathNextTick) * baseContamProbs[key]
														   * Math.min(((newplant.weed || newplant.fungus) ? tile_boost[2] : 1), 1);
									s.plantsNextTick[key].probImmature = this_prob_contam;
									prob_contam += this_prob_contam;
								}
							}
						}
						// Total probability of the tile being empty
						s.probEmptyNextTick = s.probDeathNextTick * (1 - prob_contam);
						// Maturity
						if(tile[1] >= s.plant.mature) {
							s.plantsNextTick[s.plant.key].probMature = (1 - s.probDeathNextTick) * (1 - prob_contam);
						} else {
							var prob_mature = calcProbAgingGT(Math.ceil(s.plant.mature - tile[1]), s.plant.ageTick,
																s.plant.ageTickR, tile_boost[0]);
							s.plantsNextTick[s.plant.key].probImmature = (1 - s.probDeathNextTick)
																			* (1 - prob_contam) * (1 - prob_mature);
							s.plantsNextTick[s.plant.key].probMature = (1 - s.probDeathNextTick) * (1 - prob_contam) * prob_mature;
						}
					} 
				}
			}
			
			
			wrap.recalculateTileSpread = function(x, y, loops) {
				var s = this.tileStatus[y][x];
				if(!this.garden.isTileUnlocked(x, y)) {
					if(s.unlocked) {
						// The tile somehow became locked
						s.plant = null;
						s.probGrowthNextTick = 0;
						s.probDeathNextTick = 0;
						s.probEmptyNextTick = 0;
						s.underEffects = false;
					}
				} else {
					s.unlocked = true;
					var tile_boost = this.garden.plotBoost[y][x];
					
					if(!s.plant) {
						// If there is no plant, calculate mutations and weeds
						// A plant cannot die and be replaced on the same tick
						var prob_empty = 1;
						if(loops > 0) { // Maybe there will be some need to call this function with loops = 0
							this.callNextOffset(x, y, 0, 0, 1, this.zeroPlantMaps[0], this.zeroPlantMaps[1], s.plantsNextTick);
							for(var key in s.plantsNextTick) {
								var p = s.plantsNextTick[key];
								prob_empty -= p.probImmature;
								if(loops > 1) {
									// Since .probMature must be 0, we use it to temorarily store this probability
									p.probMature = p.probImmature;
								}
							}
							if(loops > 1) {
								for(var loop = 2; loop <= loops; ++loop) {
									var new_prob_empty = 1;
									for(key in s.plantsNextTick) {
										var p = s.plantsNextTick[key];
										p.probImmature += prob_empty * p.probMature;
										new_prob_empty -= p.probImmature;
									}
									prob_empty = new_prob_empty;
								}
								for(key in s.plantsNextTick) {
									s.plantsNextTick[key].probMature = 0;
								}
							}
						}
						// Weeds
						if(prob_empty > 0 && this.weedKey) {
							var prob_nn = this.calcProbNoNeighbors(x, y);
							if(prob_nn > 0) {
								var wp = this.weedProb * prob_empty * prob_nn * this.garden.soilsById[this.garden.soil].weedMult * tile_boost[2];
								s.plantsNextTick[this.weedKey].probImmature += wp;
								prob_empty *= (1 - wp);
							}
						}
						// Final probability that it'll remain empty
						s.probEmptyNextTick = prob_empty;
					}
				}
			}
			
			
			wrap.recalculateAllTiles = function(loops) {
				// Doesn't account for the possibility that x or y can ALWAYS be greater than 0,
				// but in unmodded game it's impossible
				if(KlattmoseUtilities.config.patches.gardenOrderofOperations){
					for(var y = 0; y < this.maxPlotHeight; ++y) {
						for(var x = 0; x < this.maxPlotWidth; ++x) {
							this.recalculateTileAge(x, y, loops);
						}
					}
					for(var y = 0; y < this.maxPlotHeight; ++y) {
						for(var x = 0; x < this.maxPlotWidth; ++x) {
							this.recalculateTileSpread(x, y, loops);
						}
					}
				}else{
					for(var y = 0; y < this.maxPlotHeight; ++y) {
						for(var x = 0; x < this.maxPlotWidth; ++x) {
							this.recalculateTile(x, y, loops);
						}
					}
				}
			}
			
		}
		
		if(AcharvaksAgronomicon.isLoaded) (AcharvaksAgronomicon.postloadHooks[AgroPosition])(AcharvaksAgronomicon);
	}


	KlattmoseUtilities.ReplaceNativePantheon = function() {
		if(!Game.customMinigame['Temple'].slotGod) Game.customMinigame['Temple'].slotGod = [];
		
		Game.customMinigame['Temple'].slotGod.push(function(){
			if(KlattmoseUtilities.config.patches.slotGodFix) delete Game.Objects['Temple'].minigame.slot[-1];
		});
		
		/*CCSE.MinigameReplacer(function(){
			var M = Game.Objects['Temple'].minigame;
			
			Game.customMinigame['Temple'].slotGod.push(function(){
				if(KlattmoseUtilities.config.patches.slotGodFix) delete M.slot[-1];
			});
			
		}, 'Temple');*/
		
	}


	KlattmoseUtilities.ReplaceNativeGrimoire = function() {
		CCSE.MinigameReplacer(function(){
			var M = Game.Objects['Wizard tower'].minigame;
			
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
		}, 'Wizard tower');
		
	}
	
	if(CCSE.ConfirmGameVersion(KlattmoseUtilities.name, KlattmoseUtilities.version, KlattmoseUtilities.GameVersion)) Game.registerMod(KlattmoseUtilities.name, KlattmoseUtilities); // KlattmoseUtilities.init();
}

if(!KlattmoseUtilities.isLoaded){
	if(CCSE && CCSE.isLoaded){
		KlattmoseUtilities.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(KlattmoseUtilities.launch);
	}
}