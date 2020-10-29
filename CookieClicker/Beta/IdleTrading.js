Game.Win('Third-party');
if(IdleTrading === undefined) var IdleTrading = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (0 ? 'Beta/' : '') + 'CCSE.js');
IdleTrading.name = 'Idle Trading';
IdleTrading.version = '1.2';
IdleTrading.GameVersion = '2.03';

IdleTrading.launch = function(){
	IdleTrading.defaultConfig = function(){
		var M = Game.Objects['Bank'].minigame;
		var conf = {
			goods: [],
			autoBuy: 1,
			autoSell: 1
		};
		
		for(var iG = 0; iG < M.goodsById.length; iG++){
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
		IdleTrading.loadConfig();
		CCSE.customLoad.push(IdleTrading.loadConfig);
		CCSE.customSave.push(IdleTrading.saveConfig);
		
		IdleTrading.ReplaceGameMenu();
		IdleTrading.ReplaceNativeMarket();
		
		
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
			str += '<input id="IdleTrading_buyThresh_' + iG + '" class="option" style="width:65px;" value="' + conf.buyThresh + '" onChange="IdleTrading.UpdatePref(' + iG + ', this.value, 0)"></input>';
			str += '<input id="IdleTrading_sellThresh_' + iG + '" class="option" style="width:65px;" value="' + conf.sellThresh + '" onChange="IdleTrading.UpdatePref(' + iG + ', this.value, 1)"></input>';
			str += '<label>Historical min: <b>$' + Beautify(conf.minPrice, 2) + '</b>; Historical max: <b>$' + Beautify(conf.maxPrice, 2) + '</b></label>';
			str += '</div>';
		}
		
		return str;
	}


	//***********************************
	//    Configuration<b>$'+Beautify(val*me.stock,2)+'</b>
	//***********************************
	
	IdleTrading.saveConfig = function(config){
		CCSE.save.OtherMods.IdleTrading = IdleTrading.config;
	}

	IdleTrading.loadConfig = function(){
		if(CCSE.save.OtherMods.IdleTrading){
			var conf = CCSE.save.OtherMods.IdleTrading;
			
			for(var pref in conf){
				if(pref == "goods"){
					for(var iG = 0; iG < conf.goods.length; iG++){
						for(var pref2 in conf.goods[iG]){
							IdleTrading.config.goods[iG][pref2] = conf.goods[iG][pref2];
						}
					}
				}
				else{
					IdleTrading.config[pref] = conf[pref];
				}
			}
		}
	}

	IdleTrading.restoreDefaultConfig = function(mode){
		IdleTrading.config = IdleTrading.defaultConfig();
		if(mode == 2) IdleTrading.saveConfig(IdleTrading.config);
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
		IdleTrading.saveConfig(IdleTrading.config);
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
	
	
	if(CCSE.ConfirmGameVersion(IdleTrading.name, IdleTrading.version, IdleTrading.GameVersion)) IdleTrading.init();
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