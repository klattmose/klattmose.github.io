if(IdleTrading === undefined) var IdleTrading = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (0 ? 'Beta/' : '') + 'CCSE.js');
IdleTrading.name = 'Idle Trading';
IdleTrading.version = '1.6';
IdleTrading.GameVersion = '2.031';

IdleTrading.launch = function(){
	IdleTrading.defaultConfig = function(){
		//var M = Game.Objects['Bank'].minigame;
		var conf = {
			goods: [],
			autoBuy: 1,
			autoSell: 1
		};
		
		for(var iG = 2; iG < Game.ObjectsN; iG++){
			conf.goods.push({
				active: true,
				buyThresh: -1,
				sellThresh: -1,
				minPrice: 99999,
				maxPrice:-99999
			});
		}
		
		return conf;
	}

	IdleTrading.init = function(){
		IdleTrading.isLoaded = 1;
		
		IdleTrading.restoreDefaultConfig(1);
		if(CCSE.config.OtherMods.IdleTrading && !Game.modSaveData[IdleTrading.name]) Game.modSaveData[IdleTrading.name] = JSON.stringify(CCSE.config.OtherMods.IdleTrading);
		/*IdleTrading.load();
		CCSE.customLoad.push(IdleTrading.load);
		CCSE.customSave.push(IdleTrading.save);*/
		
		IdleTrading.ReplaceGameMenu();
		CCSE.MinigameReplacer(IdleTrading.ReplaceNativeMarket, "Bank");
		
		
		//***********************************
		//    Post-Load Hooks 
		//    To support other mods interfacing with this one
		//***********************************
		if(IdleTrading.postloadHooks) {
			for(var i = 0; i < IdleTrading.postloadHooks.length; ++i) {
				IdleTrading.postloadHooks[i]();
			}
		}
		
		if (Game.prefs.popups) Game.Popup(IdleTrading.name + ' loaded!');
		else Game.Notify(IdleTrading.name + ' loaded!', '', '', 1, 1);
	}


	//***********************************
	//    Menu Replacer
	//***********************************
	
	IdleTrading.ReplaceGameMenu = function(){
		Game.customOptionsMenu.push(function(){
			CCSE.AppendCollapsibleOptionsMenu(IdleTrading.name, IdleTrading.getMenuString());
		});
		
		Game.customStatsMenu.push(function(){
			CCSE.AppendStatsVersionNumber(IdleTrading.name, IdleTrading.version);
		});
	}

	IdleTrading.getMenuString = function(){
		if(Game.Objects["Bank"].minigameLoaded){
			var M = Game.Objects['Bank'].minigame;
			
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
			
			/*var WriteButton = function(goodID, button, on, off, callback, invert){
				var invert = invert ? 1 : 0;
				if (!callback) callback = '';
				callback += 'PlaySound(\'snd/tick.mp3\');';
				return '<a class="option' + ((IdleTrading.config.goods[goodID].active^invert) ? '' : ' off') + '" id="' + button + '" ' + Game.clickStr + '="IdleTrading.ToggleGood(' + goodID + ',\'' + button + '\',\'' + on.replace("'","\\'") + '\',\'' + off.replace("'","\\'") + '\',\'' + invert + '\');' + callback + '">' + (IdleTrading.config.goods[goodID].active ? on : off) + '</a>';
			}*/
			
			function ToggleButton(prefName, button, on, off, callback, invert){
				var invert = invert ? 1 : 0;
				if(!callback) callback = '';
				callback += 'PlaySound(\'snd/tick.mp3\');';
				return '<a class="option' + ((IdleTrading.config[prefName]^invert) ? '' : ' off') + '" id="' + button + '" ' + Game.clickStr + '="IdleTrading.Toggle(\'' + prefName + '\', \'' + button + '\', \'' + on + '\', \'' + off + '\', \'' + invert + '\');' + callback + '">' + (IdleTrading.config[prefName] ? on : off) + '</a>';
			}
			
			
			var str = 	'<div class="listing"><a class="option" ' + Game.clickStr + '="IdleTrading.restoreDefaultConfig(2); PlaySound(\'snd/tick.mp3\'); Game.UpdateMenu();">Restore Default</a></div>' + 
						'<div class="listing">' + ToggleButton('autoBuy', 'IdleTrading_autoBuyButton', 'AutoBuy ON', 'AutoBuy OFF', "") +
												  ToggleButton('autoSell', 'IdleTrading_autoSellButton', 'AutoSell ON', 'AutoSell OFF', "") + '</div>';
			
			str += writeHeader('Goods');
			
			for(var iG = 0; iG < M.goodsById.length; iG++){
				var me = M.goodsById[iG];
				var conf = IdleTrading.config.goods[iG];
				
				str += '<div class="listing" style="text-align:left;"><div class="icon" style="pointer-events:none;display:inline-block;transform:scale(0.5);margin:-16px -18px -16px -14px;vertical-align:middle;background-position:' + (-me.icon[0] * 48) + 'px ' + (-me.icon[1] * 48) + 'px;"></div><span class="bankSymbol" style="width:30px;overflow:hidden;white-space:nowrap;">' + me.symbol + '</span>';
				str += '<label> Buy at:</label><input id="IdleTrading_buyThresh_' + iG + '" class="option" style="width:65px;" value="' + conf.buyThresh + '" onChange="IdleTrading.UpdatePref(' + iG + ', this.value, 0)"></input>';
				str += '<label> Sell at:</label><input id="IdleTrading_sellThresh_' + iG + '" class="option" style="width:65px;" value="' + conf.sellThresh + '" onChange="IdleTrading.UpdatePref(' + iG + ', this.value, 1)"></input>';
				str += '<label>Historical min: <b>$' + Beautify(conf.minPrice, 2) + '</b>; Historical max: <b>$' + Beautify(conf.maxPrice, 2) + '</b></label>';
				str += '</div>';
			}
			
			return str;
		}
		else{
			return '<div class="listing">Stock market minigame not loaded!</div>';
		}
	}


	//***********************************
	//    Configuration
	//***********************************
	
	IdleTrading.save = function(){
		//CCSE.config.OtherMods.IdleTrading = IdleTrading.config;
		if(CCSE.config.OtherMods.IdleTrading) delete CCSE.config.OtherMods.IdleTrading; // no need to keep this, it's now junk data
		return JSON.stringify(IdleTrading.config);
	}

	IdleTrading.load = function(str){
		var config = JSON.parse(str);
//		if(CCSE.config.OtherMods.IdleTrading){
//			var config = CCSE.config.OtherMods.IdleTrading;
			
			for(var pref in config){
				if(pref == "goods"){
					for(var iG = 0; iG < config.goods.length; iG++){
						for(var pref2 in config.goods[iG]){
							IdleTrading.config.goods[iG][pref2] = config.goods[iG][pref2];
						}
					}
				}
				else{
					IdleTrading.config[pref] = config[pref];
				}
			}
//		}
	}

	IdleTrading.restoreDefaultConfig = function(mode){
		IdleTrading.config = IdleTrading.defaultConfig();
		if(mode == 2) IdleTrading.save(IdleTrading.config);
	}
	
	IdleTrading.Toggle = function(prefName, button, on, off, invert){
		if(IdleTrading.config[prefName]){
			l(button).innerHTML = off;
			IdleTrading.config[prefName] = 0;
		}
		else{
			l(button).innerHTML = on;
			IdleTrading.config[prefName] = 1;
		}
		l(button).className = 'option' + ((IdleTrading.config[prefName] ^ invert) ? '' : ' off');
	}
	
	IdleTrading.ToggleGood = function(goodID, button, on, off, invert){
		if (IdleTrading.config.goods[goodID]){
			l(button).innerHTML = off;
			IdleTrading.config.goods[goodID].active = 0;
		}else{
			l(button).innerHTML = on;
			IdleTrading.config.goods[goodID].active = 1;
		}
		
		l(button).className = 'option' + ((IdleTrading.config.goods[goodID].active^invert) ? '' : ' off');
		IdleTrading.save(IdleTrading.config);
	}
	
	IdleTrading.UpdatePref = function(goodID, value, mode){
		var val = parseFloat(value);
		if(!isNaN(val)){
			if(mode == 0) IdleTrading.config.goods[goodID].buyThresh = val;
			if(mode == 1) IdleTrading.config.goods[goodID].sellThresh = val;
		}
		Game.UpdateMenu();
	}
	

	//***********************************
	//    Functionality
	//***********************************
	
	IdleTrading.ReplaceNativeMarket = function() {
		if(!Game.customMinigame['Bank'].tick) Game.customMinigame['Bank'].tick = [];
		Game.customMinigame['Bank'].tick.push(IdleTrading.Logic);
	}
	
	IdleTrading.Logic = function(){
		var M = Game.Objects['Bank'].minigame;
		for(var iG = 0; iG < M.goodsById.length; iG++){
			var good = M.goodsById[iG];
			var conf = IdleTrading.config.goods[iG];
			var price = M.getGoodPrice(good);
			
			if(IdleTrading.config.autoBuy && conf.buyThresh != -1){
				if(price <= conf.buyThresh) M.buyGood(iG, 10000);
			}
			if(IdleTrading.config.autoSell && conf.sellThresh != -1){
				if(price >= conf.sellThresh) M.sellGood(iG, 10000);
			}
			
			if(price < conf.minPrice) conf.minPrice = price;
			if(price > conf.maxPrice) conf.maxPrice = price;
		}
	}
	
	
	if(CCSE.ConfirmGameVersion(IdleTrading.name, IdleTrading.version, IdleTrading.GameVersion)) Game.registerMod(IdleTrading.name, IdleTrading); // IdleTrading.init();
}

if(!IdleTrading.isLoaded){
	if(CCSE && CCSE.isLoaded){
		IdleTrading.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(IdleTrading.launch);
	}
}