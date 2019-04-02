var M = {};
M.parent = Game.Objects['Chancemaker'];
M.parent.minigame = M;

M.launch = function(){
	var M = this;
	M.name = M.parent.minigameName;
	M.savePrefix = 'minigameCasino';
	//M.sourceFolder = '../minigameCasino/';
	var script = l('minigameScript-' + M.parent.id);
	var src = script.src;
	M.sourceFolder = src.substring(0, src.lastIndexOf('/') + 1);
	M.cardsImage = M.sourceFolder + 'img/cards.png'
	M.iconsImage = M.sourceFolder + 'img/casinoIcons.png'
	M.chancemakerChance = 0.0003;
	M.beatLength = 750;
	
	M.init = function(div){
		// It's possible that the save data might get lost if entrusted to the game's save
		if(localStorage.getItem(M.savePrefix) != null) M.parent.minigameSave = localStorage.getItem(M.savePrefix);
		M.saveString = M.parent.minigameSave;
		
		M.cards = [];
		M.cards.push({pip: 0, value:0, suit: 0});
		for(var j = 0; j < 4; j++) for(var i = 1; i <= 13; i++) M.cards.push({pip: i, value: (i < 10 ? i : 10), suit: j});
		
		M.wins = 0;
		M.winsT = 0;
		M.tiesLost = 0;
		M.ownLuckWins = 0;
		M.netTotal = 0;
		
		M.phases = {
			inactive:0,
			deal:1,
			firstTurn:2,
			playerTurn:3,
			dealerTurn:4,
			evaluate:5
		}
		
		
		//***********************************
		//    Achievements
		//***********************************
		M.Achievements = [];
		M.Achievements.push(new Game.Achievement('Card minnow', 'Win <b>21</b> hands of blackjack.', [0, 0, M.iconsImage]));
		M.Achievements.push(new Game.Achievement('Card trout', 'Win <b>210</b> hands of blackjack.', [0, 0, M.iconsImage]));
		M.Achievements.push(new Game.Achievement('Card shark', 'Win <b>2100</b> hands of blackjack.', [0, 0, M.iconsImage]));
		M.Achievements.push(new Game.Achievement('Five card stud', "Win a hand of blackjack with <b>5</b> cards in your hand.<q>Wait, what game are you playing again?</q>", [0, 0, M.iconsImage]));
		M.Achievements.push(new Game.Achievement("Why can't I hold all these cards?", 'Win a hand of blackjack with <b>6</b> cards in your hand.', [0, 0, M.iconsImage]));
			Game.last.pool = 'shadow';
		M.Achievements.push(new Game.Achievement('Ace up your sleeve', "Win <b>13</b> hands of blackjack through chancemaker intervention in one ascension.<q>I'll tell you what the odds are.</q>", [0, 0, M.iconsImage]));
		M.Achievements.push(new Game.Achievement('Paid off the dealer', "Win <b>" + (13 * 13) + "</b> hands of blackjack through chancemaker intervention in one ascension.<q>Takes money to make money.</q>", [0, 0, M.iconsImage]));
		M.Achievements.push(new Game.Achievement('Deal with the Devil', "Win <b>666</b> hands of blackjack through chancemaker intervention in one ascension.<q>Just sign right here.</q>", [0, 0, M.iconsImage]));
			Game.last.pool = 'shadow';
		M.Achievements.push(new Game.Achievement('Blackjack!', "Be dealt a hand totaling 21 naturally.", [0, 0, M.iconsImage]));
		M.Achievements.push(new Game.Achievement('I like to live dangerously', "Hit on <b>17</b> or above without going over <b>21</b>.<q>My name is Number 2. This is my Italian confidential secretary. Her name is Alotta. Alotta Fagina.</q>", [0, 0, M.iconsImage]));
		M.Achievements.push(new Game.Achievement('I also like to live dangerously', "Win with a score of <b>5</b> or less.<q>Yeah baby!</q>", [0, 0, M.iconsImage]));
			Game.last.pool = 'shadow';
		
		for(var i = 0; i < M.Achievements.length; i++) M.Achievements[i].order = 1000000 + i / 100;
		
		
		//***********************************
		//    Upgrades
		//***********************************
		M.Upgrades = [];
		M.Upgrades.push(new Game.Upgrade('Raise the stakes', "Can bet a minute of CPS at a time.<q>Now we're getting somewhere!</q>", 10, [0, 0, M.iconsImage])); 
			Game.last.buyFunction = function(){M.buildSidebar();}
		M.Upgrades.push(new Game.Upgrade('High roller!', "Can bet an hour of CPS at a time.<q>If you have to ask, you can't afford it.</q>", 60, [0, 0, M.iconsImage])); 
			Game.last.buyFunction = function(){M.buildSidebar();}
		M.Upgrades.push(new Game.Upgrade('Math lessons', "Show the value of your current blackjack hand.<q>C'mon, it's not that hard.</q>", 1, [0, 0, M.iconsImage])); 
			Game.last.buyFunction = function(){M.buildTable();}
		M.Upgrades.push(new Game.Upgrade('Counting cards', "Keeps track of which cards have been played. 2-6 increase the count by 1. 10-K and Aces decrease the count by 1. Higher counts give better odds.<q>Technically not cheating, but casinos frown on this sort of thing.</q>", 21, [0, 0, M.iconsImage])); 
		M.Upgrades.push(new Game.Upgrade('Tiebreaker', "Ties push to the player, not the dealer.<q>Look at me. I'm the dealer now.</q>", 15, [0, 0, M.iconsImage])); 
		M.Upgrades.push(new Game.Upgrade('I make my own luck', "Each Chancemaker gives a <b>0.0<span></span>3%</b> chance to instantly win the hand.<q>Wait, that's illegal.</q>", 60, [0, 0, M.iconsImage])); 
		M.Upgrades.push(new Game.Upgrade('Infinite Improbability Drive', "Chancemaker chance to instantly win the hand is <b>doubled</b>.<q>You stole a protoype spaceship just to cheat at cards?</q>", 180, [0, 0, M.iconsImage]));
		
		for(var i = 0; i < M.Upgrades.length; i++){
			M.Upgrades[i].order = 1000000 + i / 100;
			M.Upgrades[i].priceFunc = function(){return this.basePrice * Game.cookiesPs * 60;};
		}
		
		
		M.reshuffle = function(deckCount){
			M.Deck = [];
			for(var i = 0; i < M.deckCount; i++) for(var j = 1; j < M.cards.length; j++) M.Deck.push(M.cards[j]);
			M.cardCount = 0;
		}
		
		M.getHandValue = function(hand){
			hand.value = 0;
			for(var i = 0; i < hand.cards.length; i++) hand.value += hand.cards[i].value;
			for(var i = 0; i < hand.cards.length; i++) if(hand.value <= 11 && hand.cards[i].value == 1) hand.value += 10;
		}
		
		M.drawCard = function(deck){
			var i = Math.floor(Math.random() * deck.length);
			var res = deck[i];
			deck.splice(i, 1);
			
			if(res.value >= 2 && res.value <= 6) M.cardCount++
			else if(res.value == 1 || res.value >= 10) M.cardCount--;
			
			if(M.Deck.length < (M.minDecks * 52)){
				Game.Unlock('Counting cards');
				M.reshuffle();
				Game.Popup('Decks reshuffled!', Game.mouseX, Game.mouseY);
			}
			return res;
		}
		
		M.cardImage = function(card){
			var left, top;
			if(!card.pip){
				left = 2 * 79;
				top = 4 * 123;
			} else {
				left = (card.pip - 1) * 79;
				top = (card.suit) * 123;
			}
			var str = '';
			str += '-' + left + 'px ';
			str += '-' + top + 'px ';
			return str;
		}
		
		M.hit = function(hand, player){
			M.getHandValue(hand);
			var oldValue = hand.value;
			hand.cards.push(M.drawCard(M.Deck));
			M.getHandValue(hand);
			
			if(hand.value > 21){
				if(player){
					Game.Unlock('Math lessons');
					M.stand();
				}
			}else if(player && oldValue >= 17){
				Game.Win('I like to live dangerously');
			}
			
			M.buildTable();
		}
		
		M.doubledown = function(){
			Game.Spend(M.betAmount);
			M.betAmount *= 2;
			M.hit(M.hands.player[0], true);
			M.stand();
		}
		
		M.split = function(){
			Game.Spend(M.betAmount);
			
			M.hands.player.push({value:0, cards:[]});
			M.hands.player[1].cards.push(M.hands.player[0].cards[1]);
			M.hands.player[0].cards.splice(1, 1);
			
			M.hit(M.hands.player[0], true);
			M.hit(M.hands.player[1], true);
			
			M.buildSidebar();
			M.buildTable();
		}
		
		M.stand = function(){
			if(M.currentPlayerHand >= (M.hands.player.length - 1)){
				var allBust = true;
				for(var i = 0; i < M.hands.player.length; i++) if(M.hands.player[i].value <= 21) allBust = false;
				
				if(allBust){
					M.nextBeat = Date.now() + M.beatLength;
					M.phase = M.phases.evaluate;
				}else{
					M.hands.dealer.cards[1] = M.hiddenCard;
					M.getHandValue(M.hands.dealer);
					M.phase = M.phases.dealerTurn;
					if(M.hands.dealer.value >= 17){
						M.currentPlayerHand = 0;
						M.phase = M.phases.evaluate;
					}
					M.nextBeat = Date.now() + M.beatLength;
				}
				
			}else{
				M.currentPlayerHand++;
			}
			
			M.buildSidebar()
			M.buildTable();
		}
		
		M.instantWinChance = function(){ return (Game.Has('I make my own luck') ? (1 - Math.pow(1 - M.chancemakerChance * (Game.Has('Infinite Improbability Drive') ? 2 : 1), M.parent.amount)) : 0); }
		
		M.toggleBetMode = function(){
			if(M.betMode == 1 && Game.Has('Raise the stakes')) M.betMode = 2;
			else if(M.betMode < 3 && Game.Has('High roller!')) M.betMode = 3;
			else M.betMode = 1;
			
			M.buildSidebar();
		}
		
		
		M.backupUpdateMenu = Game.UpdateMenu;
		Game.UpdateMenu = function(){
			M.backupUpdateMenu();
			
			if(Game.onMenu=='stats' && (M.ownLuckWins || M.netTotal)){
				var sections = document.getElementsByClassName('subsection');
			
				for(var i = 0; i < sections.length; i++){
					if(sections[i].innerHTML.indexOf('General') > 0 && M.netTotal){
						var spl = sections[i].innerHTML.split('</div><br><div class="listing">');
						sections[i].innerHTML = spl[0] + '</div><div class="listing"><b>Blackjack has earned you :</b> <div class="price plain">' + Game.tinyCookie() + Beautify(M.netTotal) + '</div>' + '</div><br><div class="listing">' + spl[1];
						//sections[i].innerHTML += '<br/><div class="listing"><b>Blackjack has earned you :</b> <div class="price plain">' + Game.tinyCookie() + Beautify(M.netTotal) + '</div></div>';
					}
					else if(sections[i].innerHTML.indexOf('Special') > 0 && M.ownLuckWins){
						var spl = sections[i].innerHTML.split('</div><div class="listing">');
						spl.splice(1, 0, '<b>Made your own luck :</b> ' + M.ownLuckWins + ' times');
						sections[i].innerHTML = spl.join('</div><div class="listing">');
						//sections[i].innerHTML += '<div class="listing"><b>Made your own luck :</b> ' + M.ownLuckWins + ' times</div>';
					}
				}
			}
		}
		
		M.buildSidebar = function(){
			var mode = '';
			
			if(M.betMode == 1){
				mode = 'second';
			}else if(M.betMode == 2){
				mode = 'minute';
			}else if(M.betMode == 3){
				mode = 'hour';
			}
			var str = '';
			
			if(Game.Has('Raise the stakes') || Game.Has('High roller!')) str += '<div>Bet: ' + Beautify(M.betChoice) + ' <a class="option" id="casinoBetModeToggle" >' + mode + (M.betChoice == 1 ? '' : 's') + '</a> of CPS</div>';
			else str += '<div>Bet: ' + Beautify(M.betChoice) + ' ' + mode + (M.betChoice == 1 ? '' : 's') + ' of CPS</div>';
			
			str += '<div id="casinoCurrentBet">(' + Beautify(M.betAmount) + ' cookies)</div>';
			M.moneyL.innerHTML = str;
			
			
			var str = '';
			if(M.phase == M.phases.inactive) str += '<div class="listing"><a class="option" id="casinoDeal" >Deal</a></div>';
			else str += '<div class="listing">Deal</div>';
			if(M.phase == M.phases.firstTurn || M.phase == M.phases.playerTurn) str += '<div class="listing"><a class="option" id="casinoHit" >Hit</a></div>';
			else str += '<div class="listing">Hit</div>';
			if(M.phase == M.phases.firstTurn && Game.cookies >= M.betAmount) str += '<div class="listing"><a class="option" id="casinoDoubledown" >Double Down</a></div>';
			else str += '<div class="listing">Double Down</div>';
			if(M.phase == M.phases.firstTurn && Game.cookies >= M.betAmount && M.hands.player[0].cards[0].pip == M.hands.player[0].cards[1].pip) str += '<div class="listing"><a class="option" id="casinoSplit" >Split</a></div>';
			else str += '<div class="listing">Split</div>';
			if(M.phase == M.phases.firstTurn || M.phase == M.phases.playerTurn) str += '<div class="listing"><a class="option" id="casinoStand" >Stand</a></div>';
			else str += '<div class="listing">Stand</div>';
			M.actionsL.innerHTML = str;
			
			
			
			if(l('casinoBetModeToggle')) AddEvent(l('casinoBetModeToggle'), 'click', function(){return function(){
				PlaySound('snd/tick.mp3');
				M.toggleBetMode();
			}}()); 
			if(l('casinoDeal')) AddEvent(l('casinoDeal'), 'click', function(){return function(){
				PlaySound('snd/tick.mp3');
				M.istep = 0;
				M.phase = M.phases.deal;
				M.nextBeat = Date.now();
			}}()); 
			if(l('casinoHit')) AddEvent(l('casinoHit'), 'click', function(){return function(){
				PlaySound('snd/tick.mp3');
				M.phase = M.phases.playerTurn;
				M.hit(M.hands.player[M.currentPlayerHand], true);
				M.buildSidebar();
			}}()); 
			if(l('casinoDoubledown')) AddEvent(l('casinoDoubledown'), 'click', function(){return function(){
				PlaySound('snd/tick.mp3');
				M.phase = M.phases.playerTurn;
				M.doubledown();
			}}()); 
			if(l('casinoSplit')) AddEvent(l('casinoSplit'), 'click', function(){return function(){
				PlaySound('snd/tick.mp3');
				M.phase = M.phases.playerTurn;
				M.split();
			}}()); 
			if(l('casinoStand')) AddEvent(l('casinoStand'), 'click', function(){return function(){
				PlaySound('snd/tick.mp3');
				M.phase = M.phases.playerTurn;
				M.stand();
			}}()); 
		}
		
		M.buildTable = function(){
			var str = '<table id="casinoBJTable">';
			str += '<tr><td>Dealer\'s hand:' + (Game.Has('Math lessons') ? ('<br/>Score: ' + M.hands.dealer.value) : '') + '</td>';
			for(var i = 0; i < M.hands.dealer.cards.length; i++) str += '<td><div class="casinoBJCardImage" style="background-image:url(' + M.cardsImage + '); background-position:' + M.cardImage(M.hands.dealer.cards[i]) + ';" /></td>';
			str += '</tr>';
			str += '<tr style="height:75px;"><td></td></tr>';
			str += '<tr><td>Player\'s hand' + (M.hands.player.length > 1 ? (' (' + (M.currentPlayerHand + 1) + ' of ' + M.hands.player.length + ')') : '') + ':' + (Game.Has('Math lessons') ? ('<br/>Score: ' + M.hands.player[M.currentPlayerHand].value) : '') + '</td>'
			for(var i = 0; i < M.hands.player[M.currentPlayerHand].cards.length; i++) str += '<td><div class="casinoBJCardImage" style="background-image:url(' + M.cardsImage + '); background-position:' + M.cardImage(M.hands.player[M.currentPlayerHand].cards[i]) + ';" /></td>';
			str += '</tr>';
			str += '</table>';
			
			M.gameL.innerHTML = str;
		}
		
		var str = '';
		str += '<style>' + 
		'#casinoBG{background:url(img/shadedBorders.png), url(' + M.sourceFolder + 'img/BGcasino.jpg); background-size:100% 100%, auto; position:absolute; left:0px; right:0px; top:0px; bottom:16px;}' + 
		'#casinoContent{position:relative; box-sizing:border-box; padding:4px 24px; height:450px;}' +
		'#casinoSidebar{text-align:center; margin:0px; padding:0px; position:absolute; left:4px; top:4px; bottom:4px; right:65%; overflow-y:auto; overflow-x:hidden; box-shadow:8px 0px 8px rgba(0,0,0,0.5);}' +
		'#casinoSidebar .listing{text-align:left;}' +
		'#casinoTable{text-align:center; position:absolute; right:0px; top:0px; bottom:0px; overflow-x:auto; overflow:hidden;}' + 
		'.casinoBJCardImage{position: relative; width: 79px; height: 123px; left: 0px; top: 0px; overflow: visible;}' + 
		'.casinoSpacer{position: relative; width: 79px; height: 123px; left: 0px; top: 0px; overflow: visible;}' + 
		'#casinoBJTable td{text-align:center; vertical-align: middle; width:90px;}' + 
		'#casinoBJTable tr{height:150px}' + 
		'#casinoBJTable{margin-left:auto; margin-right:auto;}' + 
		'.casinoSidebarLabel{font-size:12px;width:100%;padding:2px;margin-top:4px;margin-bottom:-4px;}' + 
		'#casinoGame{position: relative;}' + 
		'#casinoInfo{position: relative;text-align:center; font-size:11px; margin-top:12px; color:rgba(255,255,255,0.75); text-shadow:-1px 1px 0px #000;}' + 
		'</style>';
		str += '<div id="casinoBG"></div>';
		str += '<div id="casinoContent">';
			str += '<div id="casinoSidebar" class="framed">';
				str+='<div class="title casinoSidebarLabel">Cash</div><div class="line"></div>';
				str += '<div id="casinoMoney"></div>';
				str+='<div class="title casinoSidebarLabel">Actions</div><div class="line"></div>';
				str += '<div id="casinoActions"></div>';
			str += '</div>';
			str += '<div id="casinoTable">';
				str += '<div id="casinoGame"></div>';
				str += '<div id="casinoInfo">Hello World!</div>';
			str += '</div>';
		str += '</div>';
		div.innerHTML = str;
		
		M.sidebarL = l('casinoSidebar');
		M.moneyL = l('casinoMoney');
		M.actionsL = l('casinoActions');
		M.tableL = l('casinoTable');
		M.gameL = l('casinoGame');
		M.infoL = l('casinoInfo');
		
		M.reset();
		
		M.buildSidebar();
		M.buildTable();
	}
	
	M.save = function(){
		//output cannot use ",", ";" or "|"
		
		var getMinigameStateSave = function(){
			var res = '';
			res += parseInt(M.parent.onMinigame ? '1' : '0');
			res += '_' + parseInt(M.wins);
			res += '_' + parseInt(M.winsT);
			res += '_' + parseInt(M.ownLuckWins);
			res += '_' + parseInt(M.tiesLost);
			res += '_' + parseInt(M.betMode);
			res += '_' + parseInt(M.betChoice);
			res += '_' + parseFloat(M.netTotal);
			res += '_' + parseInt(M.cardCount);
			
			return res;
		}
		
		var getGameStateSave = function(){
			var res = '';
			res += parseInt(M.currentPlayerHand);
			res += '_' + parseInt(M.nextBeat);
			res += '_' + parseInt(M.phase);
			res += '_' + parseInt(M.istep);
			res += '_' + parseFloat(M.betAmount);
			res += '_' + parseInt(M.hiddenCard.pip + 13 * M.hiddenCard.suit);
			
			return res;
		}
		
		var getCardSave = function(deck){
			var res = '';
			for(var i = 0; i < deck.length; i++) res += (res.length ? '-' : '') + (deck[i].pip + 13 * deck[i].suit);
			return res;
		}
		
		var getPlayerHandsSave = function(){
			var res = '';
			for(var i = 0; i < M.hands.player.length; i++) res += (res.length ? '_' : '') + getCardSave(M.hands.player[i].cards);
			return res;
		}
		
		var getAchievementSave = function(){
			var res = '';
			for(var i = 0; i < M.Achievements.length; i++) res += Math.min(M.Achievements[i].won);
			return res;
		}
		
		var getUpgradeSave = function(){
			var res = '';
			for (var i in M.Upgrades){
				var me = M.Upgrades[i];
				res += Math.min(me.unlocked, 1) + '' + Math.min(me.bought, 1);
			}
			return res;
		}
		
		
		var str = getMinigameStateSave();
		str += ' ' + getGameStateSave();
		str += ' ' + getCardSave(M.hands.dealer.cards);
		str += ' ' + getPlayerHandsSave();
		str += ' ' + getCardSave(M.Deck);
		str += ' ' + getAchievementSave();
		str += ' ' + getUpgradeSave();
		
		localStorage.setItem(M.savePrefix, str);
		M.saveString = str;
		return str;
	}
	
	M.load = function(str){
		//interpret str; called after .init
		//note : not actually called in the Game's load; see "minigameSave" in main.js
		if(!str) return false;
		
		var parseMinigameStateSave = function(str){
			var i = 0;
			var spl = str.split('_');
			var on = parseInt(spl[i++] || 0);
			M.wins = parseInt(spl[i++] || 0);
			M.winsT = parseInt(spl[i++] || 0);
			M.ownLuckWins = parseInt(spl[i++] || 0);
			M.tiesLost = parseInt(spl[i++] || 0);
			M.betMode = parseInt(spl[i++] || 0);
			M.betChoice = parseInt(spl[i++] || 0);
			M.netTotal = parseFloat(spl[i++] || 0);
			M.cardCount = parseInt(spl[i++] || 0);
			
			if(on && Game.ascensionMode != 1) M.parent.switchMinigame(1);
		}
		
		var parseGameStateSave = function(str){
			var i = 0;
			var spl = str.split('_');
			M.currentPlayerHand = parseInt(spl[i++] || 0);
			M.nextBeat = parseInt(spl[i++] || 0);
			M.phase = parseInt(spl[i++] || 0);
			M.istep = parseInt(spl[i++] || 0);
			M.betAmount = parseFloat(spl[i++] || 0);
			M.hiddenCard = M.cards[parseInt(spl[i++] || 0)];
		}
		
		var parseCardSave = function(str){
			var res = [];
			if(str){
				var arr = str.split('-');
				for(var i = 0; i < arr.length; i++){
					res.push(M.cards[arr[i]]);
				}
			} 
			return res;
		}
		
		var parsePlayerHandsSave = function(str){
			M.hands.player = [];
			if(str){
				var hands = str.split('_');
				for(var i = 0; i < hands.length; i++){
					M.hands.player.push({cards:parseCardSave(hands[i])});
					M.getHandValue(M.hands.player[i]);
				} 
			}else{
				M.hands.player = [{value:0, cards:[]}];
			}
		}
		
		var parseAchievementSave = function(str){
			var spl = str.split('');
			for (var i in M.Achievements){
				var me = M.Achievements[i];
				if(spl[i]){
					var mestr = [spl[i]];
					me.won = parseInt(mestr[0]);
				}else{
					me.won = 0;
				}
				if(me.won && Game.CountsAsAchievementOwned(me.pool)) Game.AchievementsOwned++;
			}
		}
		
		var parseUpgradeSave = function(str){
			var spl = str.split('');
			for (var i in M.Upgrades){
				var me = M.Upgrades[i];
				if (spl[i * 2]){
					var mestr = [spl[i * 2],spl[i * 2 + 1]];
					me.unlocked = parseInt(mestr[0]);
					me.bought = parseInt(mestr[1]);
					if (me.bought && Game.CountsAsUpgradeOwned(me.pool)) Game.UpgradesOwned++;
				}
				else{
					me.unlocked = 0;
					me.bought = 0;
				}
			}
		}
		
		
		var i = 0;
		var spl = str.split(' ');
		parseMinigameStateSave(spl[i++] || '');
		parseGameStateSave(spl[i++] || '');
		M.hands.dealer = {cards:parseCardSave(spl[i++] || 0)};
		parsePlayerHandsSave(spl[i++] || 0);
		M.Deck = parseCardSave(spl[i++] || 0);
		M.AchievementTimeout = setTimeout(function(){ parseAchievementSave(spl[i++] || ''); }, 50);	// Need to add this delay or the achievements get wiped on a soft-load
		M.UpgradeTimeout = setTimeout(function(){ parseUpgradeSave(spl[i++] || ''); }, 50);			// Need to add this delay or the achievements get wiped on a soft-load
		
		M.getHandValue(M.hands.dealer);
		if(M.Deck.length < (M.minDecks * 52)) M.reshuffle();
		M.saveString = str;
		
		M.buildSidebar();
		M.buildTable();
	}
	
	M.reset = function(){
		M.deckCount = 4;
		M.Deck = [];
		M.hands = {dealer:{value:0, cards:[]}, player:[{value:0, cards:[]}]};
		M.hiddenCard = M.cards[0];
		M.currentPlayerHand = 0;
		M.minDecks = 2;
		M.betAmount = 0;
		M.betChoice = 1;
		M.betMode = 1;
		M.wins = 0;
		M.ownLuckWins = 0;
		M.tiesLost = 0;
		M.phase = 0;
		M.istep = 0;
		M.nextBeat = Date.now() + M.beatLength;
		
		if(M.AchievementTimeout) clearTimeout(M.AchievementTimeout);
		if(M.UpgradeTimeout) clearTimeout(M.UpgradeTimeout);
		M.reshuffle();
		
		M.buildSidebar();
		M.buildTable();
		
		setTimeout(function(M){return function(){M.onResize();}}(M), 10);
	}
	
	M.logic = function(){
		//run each frame
		if(M.betMode == 1 && M.phase == M.phases.inactive){
			M.betAmount = Math.min(Game.cookies, Game.cookiesPs * M.betChoice);
		}else if(M.betMode == 2 && M.phase == M.phases.inactive){
			M.betAmount = Math.min(Game.cookies, Game.cookiesPs * M.betChoice * 60);
		}else if(M.betMode == 3 && M.phase == M.phases.inactive){
			M.betAmount = Math.min(Game.cookies, Game.cookiesPs * M.betChoice * 60 * 60);
		}
		
		if(Date.now() > M.nextBeat){
			M.nextBeat = Date.now() + M.beatLength;
			var outcome = 0;
			
			if(M.phase == M.phases.inactive){
				
			}
			else if(M.phase == M.phases.deal){
				if(M.istep == 0){
					if(M.Deck.length < (M.minDecks * 52)) M.reshuffle();
					M.hands = {dealer:{value:0, cards:[]}, player:[{value:0, cards:[]}]};
					M.currentPlayerHand = 0;
					Game.Spend(M.betAmount);
					
					M.hit(M.hands.player[0], true);
					M.istep = 1;
				}
				else if(M.istep == 1){
					M.hit(M.hands.dealer, false);
					M.istep = 2;
				}
				else if(M.istep == 2){
					M.hit(M.hands.player[0], true);
					M.istep = 3;
				}
				else if(M.istep == 3){
					M.hit(M.hands.dealer, false);
					
					M.hiddenCard = M.hands.dealer.cards[1];
					M.hands.dealer.cards[1] = M.cards[0];
					
					M.phase = M.phases.firstTurn;
					if(Math.random() < M.instantWinChance()){
						M.hands.dealer.cards[1] = M.hiddenCard;
						
						M.hands.player[0].cards[0] = {pip:choose([10,11,12,13]), value:10, suit:choose([0,1,2,3])};
						M.hands.player[0].cards[1] = {pip:1, value:1, suit:choose([0,1,2,3])};
						
						outcome = 'instantWin';
						M.phase = M.phases.inactive;
						
					} else if(M.hands.player[0].value == 21){
						M.hands.dealer.cards[1] = M.hiddenCard;
						outcome = 'playerblackjack';
						M.phase = M.phases.inactive;
						
					} else if(M.hands.dealer.value == 21){
						M.hands.dealer.cards[1] = M.hiddenCard;
						outcome = 'dealerblackjack';
						M.phase = M.phases.inactive;
						
					} else{
						
					}
				}
			}
			else if(M.phase == M.phases.playerTurn || M.phase == M.phases.firstTurn){
				
			}
			else if(M.phase == M.phases.dealerTurn){
				if(M.hands.dealer.value < 17){
					M.hit(M.hands.dealer, false);
				}
				if(M.hands.dealer.value >= 17){
					M.currentPlayerHand = 0;
					M.phase = M.phases.evaluate;
				}
			}
			else if(M.phase == M.phases.evaluate){
				var playerHand = M.currentPlayerHand;
				M.hands.dealer.cards[1] = M.hiddenCard;
				M.buildTable();
				
				if(M.hands.player[playerHand].value > 21) outcome = 'bust';
				else if(M.hands.dealer.value > 21){
					outcome = 'dealerbust';
				} 
				else if(M.hands.dealer.value < M.hands.player[playerHand].value){
					outcome = 'win';
				}
				else if(M.hands.dealer.value > M.hands.player[playerHand].value) outcome = 'lose';
				else if(M.hands.dealer.value == M.hands.player[playerHand].value){
					outcome = 'push';
				}
				
				playerHand++;
				if(playerHand < M.hands.player.length){
					M.currentPlayerHand = playerHand;
					M.phase = M.phases.evaluate;
				} 
				else{
					M.phase = M.phases.inactive;
				}
			}
			
			M.getHandValue(M.hands.dealer);
			M.getHandValue(M.hands.player[M.currentPlayerHand]);
			
			
			if(outcome){
				var messg = '';
				var winnings = M.betAmount;
				
				switch(outcome){
					case 'instantWin':
						winnings *= 2.5;
						messg = 'You make your own luck!';
						M.ownLuckWins++;
						
						if(M.ownLuckWins >= 13) Game.Win('Ace up your sleeve');
						if(M.ownLuckWins >= 52) Game.Unlock('Infinite Improbability Drive');
						if(M.ownLuckWins >= (13 * 13)) Game.Win('Paid off the dealer');
						if(M.ownLuckWins >= 666) Game.Win('Deal with the Devil');
						break;
						
					case 'playerblackjack':
						winnings *= 2.5;
						messg = 'Blackjack!';
						Game.Unlock('I make my own luck');
						Game.Win('Blackjack!');
						break;
						
					case 'dealerblackjack':
						winnings *= 0;
						messg = 'Dealer blackjack';
						break;
					
					case 'bust':
						winnings *= 0;
						messg = 'Over 21!';
						break;
					
					case 'dealerbust':
						winnings *= 2;
						messg = 'Dealer went over 21!';
						break;
					
					case 'win':
						winnings *= 2;
						messg = 'You win!';
						break;
					
					case 'lose':
						winnings *= 0;
						messg = 'You lose';
						break;
						
					case 'push':
						if(Game.Has('Tiebreaker')){
							winnings *= 2;
							messg = 'Tie goes to player!';
						}else{
							winnings *= 0;
							messg = 'Tie goes to dealer';
							M.tiesLost++;
							if(M.tiesLost >= 7) Game.Unlock('Tiebreaker');
						}
						
						break;
						
					default:
						break;
				}
				
				messg += '<div style="font-size:65%;">';
				if(winnings > 0){
					Game.Earn(winnings);
					M.wins++;
					M.winsT++;
					messg += 'Gain ' + Beautify(Math.abs(winnings - M.betAmount)) + ' cookies!';
					
					if(M.winsT >= 7) Game.Unlock('Raise the stakes');
					if(M.winsT >= 49) Game.Unlock('High roller!');
					if(M.winsT >= 21) Game.Win('Card minnow');
					if(M.winsT >= 210) Game.Win('Card trout');
					if(M.winsT >= 2100) Game.Win('Card shark');
					
					if(M.hands.player[M.currentPlayerHand].cards.length >= 5) Game.Win('Five card stud');
					if(M.hands.player[M.currentPlayerHand].cards.length >= 6) Game.Win("Why can't I hold all these cards?");
					if(M.hands.player[M.currentPlayerHand].value <= 5) Game.Win('I also like to live dangerously');
				}else{
					messg += 'Lost ' + Beautify(Math.abs(M.betAmount)) + ' cookies';
				}
				messg += '</div>';
				
				M.netTotal += winnings - M.betAmount;
				Game.Popup(messg, Game.mouseX, Game.mouseY);
			}
			
			M.buildTable();
			M.buildSidebar();
		}
	}
	
	M.onResize = function(){
		var width = l('casinoContent').offsetWidth;
		var sidebarW = width * 0.20 - 8;
		var tableW = width * 0.80 - 8;
		M.sidebarL.style.width = sidebarW + 'px';
		M.tableL.style.width = tableW + 'px';
	}
	
	M.draw = function(){
		//run each draw frame
		var countModify = 0;
		if(M.hiddenCard && M.hands.dealer.cards[1] && M.hands.dealer.cards[1].value == 0){
			if(M.hiddenCard.value >= 2 && M.hiddenCard.value <= 6) countModify--;
			else if(M.hiddenCard.value == 1 || M.hiddenCard.value >= 10) countModify++;
		}
		M.infoL.innerHTML = 'Hands won : ' + Beautify(M.wins) + ' (total : ' + Beautify(M.winsT) + ')' + (Game.Has('Counting cards') ? ('<br/>Cards left in deck : ' + M.Deck.length + '<br/>Count : ' + (M.cardCount + countModify)) : '');
		
		l('casinoCurrentBet').innerHTML = '(' + Beautify(M.betAmount) + ' cookies)';
	}
	
	M.init(l('rowSpecial' + M.parent.id));
}

//var M = 0;