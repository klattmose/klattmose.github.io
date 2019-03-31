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
	M.chancemakerChance = 0.0005;
	
	M.init = function(div){
		// It's possible that the save data might get lost if entrusted to the game's save
		if(!M.parent.minigameSave && localStorage.getItem(M.savePrefix) != null) M.parent.minigameSave = localStorage.getItem(M.savePrefix);
		
		M.cards = [];
		M.cards.push({pip: 0, value:0, suit: 0});
		for(var j = 0; j < 4; j++) for(var i = 1; i <= 13; i++) M.cards.push({pip: i, value: (i < 10 ? i : 10), suit: j});
		
		M.wins = 0;
		M.winsT = 0;
		M.tiesLost = 0;
		M.ownLuckWins = 0;
		M.beatLength = 1000;
		
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
		M.Achievements = []; //x,y
		M.Achievements.push(new Game.Achievement('Card minnow', 'Win <b>21</b> hands of blackjack.', [24, 26]));
		M.Achievements.push(new Game.Achievement('Card trout', 'Win <b>210</b> hands of blackjack.', [24, 26]));
		M.Achievements.push(new Game.Achievement('Card shark', 'Win <b>2100</b> hands of blackjack.', [24, 26]));
		M.Achievements.push(new Game.Achievement('Five card stud', "Win a hand of blackjack with <b>5</b> cards in your hand.<q>You're such a stud!</q>", [24, 26]));
		M.Achievements.push(new Game.Achievement("Why can't I hold all these cards?", 'Win a hand of blackjack with <b>6</b> cards in your hand.', [24, 26]));
			Game.last.pool = 'shadow';
		M.Achievements.push(new Game.Achievement('Ace up your sleeve', "Win <b>13</b> hands of blackjack through chancemaker intervention in one ascension.<q>I'll tell you what the odds are.</q>", [24, 26]));
		M.Achievements.push(new Game.Achievement('Paid off the dealer', "Win <b>" + (13 * 13) + "</b> hands of blackjack through chancemaker intervention in one ascension.<q>Takes money to make money.</q>", [24, 26]));
		M.Achievements.push(new Game.Achievement('Losing is for losers', "Win <b>666</b> hands of blackjack through chancemaker intervention in one ascension.<q>If you're not cheating, are you even trying?</q>", [24, 26]));
		M.Achievements.push(new Game.Achievement('Blackjack!', "Have a score of <b>21</b> without hitting.", [24, 26]));
		M.Achievements.push(new Game.Achievement('I like to live dangerously', "Hit on <b>17</b> or above without going over <b>21</b>.<q>WHO DO YOU WORK FOR?</q>", [24, 26]));
		M.Achievements.push(new Game.Achievement('I also like to live dangerously', "Win with a score of <b>5</b> or less.<q>Yeah baby!</q>", [24, 26]));
			Game.last.pool = 'shadow';
		
		for(var i = 0; i < M.Achievements.length; i++) M.Achievements[i].order = 1000000 + i / 100;
		
		
		//***********************************
		//    Upgrades
		//***********************************
		M.Upgrades = [];
		M.Upgrades.push(new Game.Upgrade('Math lessons', "Show the value of your current blackjack hand.<q>C'mon, it's not that hard.</q>", 1, [24, 26])); 
			Game.last.priceFunc = function(){return this.basePrice * Game.cookiesPs * 60;};
			Game.last.buyFunction = function(){M.buildTable();}
		M.Upgrades.push(new Game.Upgrade('Raise the stakes', "Can bet a minute of CPS at a time.<q>Now we're getting somewhere!</q>", 10, [24, 26])); 
			Game.last.priceFunc = function(){return this.basePrice * Game.cookiesPs * 60;};
			Game.last.buyFunction = function(){M.buildSidebar();}
		M.Upgrades.push(new Game.Upgrade('High roller!', "Can bet an hour of CPS at a time.<q>If you have to ask, you can't afford it.</q>", 60, [24, 26])); 
			Game.last.priceFunc = function(){return this.basePrice * Game.cookiesPs * 60;};
			Game.last.buyFunction = function(){M.buildSidebar();}
		M.Upgrades.push(new Game.Upgrade('Tiebreaker', "Ties push to the player, not the dealer.<q>Look at me. I'm the house now.</q>", 15, [24, 26])); 
			Game.last.priceFunc = function(){return this.basePrice * Game.cookiesPs * 60;};
		M.Upgrades.push(new Game.Upgrade('I make my own luck', "Each Chancemaker gives a <b>" + (M.chancemakerChance * 100) + "%</b> chance to instantly win the hand.<q>Wait, that's illegal.</q>", 60, [24, 26])); 
			Game.last.priceFunc = function(){return this.basePrice * Game.cookiesPs * 60;};
		
		for(var i = 0; i < M.Upgrades.length; i++) M.Upgrades[i].order = 1000000 + i / 100;
		
		
		M.reshuffle = function(deckCount){
			M.Deck = [];
			for(var i = 0; i < M.deckCount; i++) for(var j = 1; j < M.cards.length; j++) M.Deck.push(M.cards[j]);
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
			
			if(M.Deck.length < (M.minDecks * 52)) M.reshuffle();
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
					M.determineHiddenDealerCard();
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
		
		M.determineHiddenDealerCard = function(){
			var hand = M.hands.dealer;
			hand.cards.splice(1, 1);
			M.hit(hand, false);
			
			while(hand.value == 21){
				M.Deck.push(hand.cards[1]);
				hand.cards.splice(1, 1);
				M.hit(hand, false);
			}
		}
		
		M.newGame = function(){
			if(M.Deck.length < (M.minDecks * 52)) M.reshuffle();
			M.hands = {dealer:{value:0, cards:[]}, player:[{value:0, cards:[]}]};
			M.currentPlayerHand = 0;
			M.phase = M.phases.firstTurn;
			Game.Spend(M.betAmount);
			
			M.hit(M.hands.player[0], true);
			M.hit(M.hands.dealer, false);
			M.hit(M.hands.player[0], true);
			M.hit(M.hands.dealer, false);
			
			var hiddenCard = M.hands.dealer.cards[1];
			M.hands.dealer.cards[1] = M.cards[0];
			
			if(Math.random() < M.instantWinChance()){
				M.Deck.push(M.hands.player[0].cards[0]);
				M.Deck.push(M.hands.player[0].cards[1]);
				M.Deck.push(hiddenCard);
				
				M.hands.player[0].cards[0] = {pip:choose([10,11,12,13]), value:10, suit:choose([0,1,2,3])}
				M.hands.player[0].cards[1] = {pip:1, value:1, suit:choose([0,1,2,3])}
				M.getHandValue(M.hands.player[0]);
				M.buildTable();
				
				M.endGame('instantWin');
				
			} else if(M.hands.player[0].value == 21){
				M.endGame('playerblackjack');
				M.Deck.push(hiddenCard);
			} else if(M.hands.dealer.value == 21){
				M.hands.dealer.cards[1] = hiddenCard;
				M.endGame('dealerblackjack');
			} else{
				M.Deck.push(hiddenCard);
			}
			
			M.buildSidebar();
			M.buildTable();
		}
		
		M.instantWinChance = function(){ return (Game.Has('I make my own luck') ? (1 - Math.pow(1 - M.chancemakerChance, M.parent.amount)) : 0); }
		
		M.endGame = function(mode){
			M.phase = M.phases.inactive;
			var messg = '';
			var winnings = M.betAmount;
			
			switch(mode){
				case 'instantWin':
					winnings *= 2.5;
					messg = 'You make your own luck!';
					M.ownLuckWins++;
					
					if(M.ownLuckWins >= 13) Game.Win('Ace up your sleeve');
					if(M.ownLuckWins >= (13 * 13)) Game.Win('Paid off the dealer');
					if(M.ownLuckWins >= 666) Game.Win('Losing is for losers');
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
			}else{
				messg += 'Lost ' + Beautify(Math.abs(M.betAmount)) + ' cookies';
			}
			messg += '</div>';
			
			
			Game.Popup(messg, Game.mouseX, Game.mouseY);
			M.buildSidebar();
		}
		
		M.toggleBetMode = function(){
			if(M.betMode == 1 && Game.Has('Raise the stakes')) M.betMode = 2;
			else if(M.betMode < 3 && Game.Has('High roller!')) M.betMode = 3;
			else M.betMode = 1;
			
			M.buildSidebar();
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
			
			if(Game.Has('Raise the stakes') || Game.Has('High roller!')) str += '<div>Bet: ' + Beautify(M.betChoice) + ' <input type=button id="casinoBetModeToggle" value="' + mode + (M.betChoice == 1 ? '' : 's') + '" /> of CPS</div>';
			else str += '<div>Bet: ' + Beautify(M.betChoice) + ' ' + mode + (M.betChoice == 1 ? '' : 's') + ' of CPS</div>';
			
			str += '<div id="casinoCurrentBet">(' + Beautify(M.betAmount) + ' cookies)</div>';
			M.moneyL.innerHTML = str;
			
			if(Game.Has('Raise the stakes') || Game.Has('High roller!')) AddEvent(l('casinoBetModeToggle'), 'click', function(){return function(){PlaySound('snd/tick.mp3');M.toggleBetMode();}}()); 
			
			
			var str = '';
			str += '<div class="listing"><input type=button id="casinoDeal" value="Deal" /></div>';
			str += '<div class="listing"><input type=button id="casinoHit" value="Hit" /></div>';
			str += '<div class="listing"><input type=button id="casinoDoubledown" value="Double Down" /></div>';
			str += '<div class="listing"><input type=button id="casinoSplit" value="Split" /></div>';
			str += '<div class="listing"><input type=button id="casinoStand" value="Stand" /></div>';
			M.actionsL.innerHTML = str;
			
			l('casinoDeal').disabled = M.phase != M.phases.inactive;
			l('casinoHit').disabled = !(M.phase == M.phases.firstTurn || M.phase == M.phases.playerTurn);
			l('casinoStand').disabled = !(M.phase == M.phases.firstTurn || M.phase == M.phases.playerTurn);
			l('casinoDoubledown').disabled = !(M.phase == M.phases.firstTurn && Game.cookies >= M.betAmount);
			l('casinoSplit').disabled = !(M.phase == M.phases.firstTurn && Game.cookies >= M.betAmount) || (M.hands.player[0].cards[0].pip != M.hands.player[0].cards[1].pip);
			
			AddEvent(l('casinoHit'), 'click', function(){return function(){PlaySound('snd/tick.mp3');M.phase = M.phases.playerTurn;M.hit(M.hands.player[M.currentPlayerHand], true);M.buildSidebar();}}()); 
			AddEvent(l('casinoStand'), 'click', function(){return function(){PlaySound('snd/tick.mp3');M.phase = M.phases.playerTurn;M.stand();}}()); 
			AddEvent(l('casinoDoubledown'), 'click', function(){return function(){PlaySound('snd/tick.mp3');M.phase = M.phases.playerTurn;M.doubledown();}}()); 
			AddEvent(l('casinoSplit'), 'click', function(){return function(){PlaySound('snd/tick.mp3');M.phase = M.phases.playerTurn;M.split();}}()); 
			AddEvent(l('casinoDeal'), 'click', function(){return function(){PlaySound('snd/tick.mp3');M.newGame();}}()); 
		}
		
		M.buildTable = function(){
			var str = '<table id="casinoBJTable">';
			str += '<tr><td>Dealer\'s hand:</td>';
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
		'#casinoContent{position:relative; box-sizing:border-box; padding:4px 24px; height:500px;}' +
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
			
			return res;
		}
		
		var getGameStateSave = function(){
			var res = '';
			res += parseInt(M.currentPlayerHand);
			res += '_' + parseInt(M.nextBeat);
			res += '_' + parseInt(M.phase);
			res += '_' + parseInt(M.istep);
			res += '_' + parseFloat(M.betAmount);
			
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
		parseAchievementSave(spl[i++] || '');
		parseUpgradeSave(spl[i++] || '');
		
		M.getHandValue(M.hands.dealer);
		if(M.Deck.length < (M.minDecks * 52)) M.reshuffle();
		
		M.buildSidebar();
		M.buildTable();
	}
	
	M.reset = function(){
		M.deckCount = 4;
		M.Deck = [];
		M.hands = {dealer:{value:0, cards:[]}, player:[{value:0, cards:[]}]};
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
			
			if(M.phase == M.phases.inactive){
				
			}
			else if(M.phase == M.phases.deal){
				
			}
			else if(M.phase == M.phases.playerTurn || M.phase == M.phases.firstTurn){
				
			}
			else if(M.phase == M.phases.dealerTurn){
				if(M.hands.dealer.value < 17){
					M.hit(M.hands.dealer, false);
					M.buildTable();
				}
				if(M.hands.dealer.value >= 17){
					M.currentPlayerHand = 0;
					M.phase = M.phases.evaluate;
				}
				
			}
			else if(M.phase == M.phases.evaluate){
				var playerHand = M.currentPlayerHand;
				var outcome = '';
				M.buildTable();
				
				if(M.hands.player[playerHand].value > 21) outcome = 'bust';
				else if(M.hands.dealer.value > 21){
					outcome = 'dealerbust';
					if(M.hands.player[playerHand].value <= 5) Game.Win('I also like to live dangerously');
				} 
				else if(M.hands.dealer.value < M.hands.player[playerHand].value){
					if(M.hands.player[playerHand].cards.length >= 5) Game.Win('Five card stud');
					if(M.hands.player[playerHand].cards.length >= 6) Game.Win("Why can't I hold all these cards?");
					outcome = 'win';
				}
				else if(M.hands.dealer.value > M.hands.player[playerHand].value) outcome = 'lose';
				else if(M.hands.dealer.value == M.hands.player[playerHand].value){
					if(Game.Has('Tiebreaker')){
						if(M.hands.player[playerHand].cards.length >= 5) Game.Win('Five card stud');
						if(M.hands.player[playerHand].cards.length >= 6) Game.Win("Why can't I hold all these cards?");
					}
					outcome = 'push';
				}
				
				M.endGame(outcome);
				
				playerHand++;
				if(playerHand < M.hands.player.length){
					M.currentPlayerHand = playerHand;
					M.phase = M.phases.evaluate;
				} 
				else{
					M.phase = M.phases.inactive;
					M.buildSidebar();
				}
			}
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
		M.infoL.innerHTML = 'Hands won : ' + Beautify(M.wins) + ' (total : ' + Beautify(M.winsT) + ')';
		l('casinoCurrentBet').innerHTML = '(' + Beautify(M.betAmount) + ' cookies)';
	}
	
	M.init(l('rowSpecial' + M.parent.id));
}

//var M = 0;