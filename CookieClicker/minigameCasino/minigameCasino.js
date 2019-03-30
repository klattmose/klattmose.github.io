var M = {};
M.parent = Game.Objects['Chancemaker'];
M.parent.minigame = M;

M.launch = function(){
	var M = this;
	M.name = M.parent.minigameName;
	M.savePrefix = 'minigameCasino';
	M.sourceFolder = 'https://klattmose.github.io/CookieClicker/minigameCasino/';
	M.cardsImage = M.sourceFolder + 'img/cards.png'
	
	M.init = function(div){
		// It's possible that the save data might get lost if entrusted to the game's save
		if(!M.parent.minigameSave && localStorage.getItem(M.savePrefix) != null) M.parent.minigameSave = localStorage.getItem(M.savePrefix);
		
		M.cards = [];
		M.cards.push({pip: 0, value:0, suit: 0});
		for(var j = 0; j < 4; j++) for(var i = 1; i <= 13; i++) M.cards.push({pip: i, value: (i < 10 ? i : 10), suit: j});
		
		M.wins = 0;
		M.winsT = 0;
		M.ownLuckWins = 0;
		
		M.reshuffle = function(deckCount){
			M.Deck = [];
			for(var i = 0; i < M.deckCount; i++) for(var j = 1; j < M.cards.length; j++) M.Deck.push(M.cards[j]);
		}
		
		M.getCardSave = function(deck){
			var res = '';
			for(var i = 0; i < deck.length; i++) res += (res.length ? '-' : '') + (deck[i].pip + 13 * deck[i].suit);
			return res;
		}
		
		M.parseCardSave = function(str){
			var res = [];
			if(str){
				var arr = str.split('-');
				for(var i = 0; i < arr.length; i++){
					res.push(M.cards[arr[i]]);
				}
			} 
			return res;
		}
		
		M.getPlayerHandsSave = function(){
			var res = '';
			for(var i = 0; i < M.hands.player.length; i++) res += (res.length ? '_' : '') + M.getCardSave(M.hands.player[i].cards);
			return res;
		}
		
		M.parsePlayerHandsSave = function(str){
			M.hands.player = [];
			if(str){
				var hands = str.split('_');
				for(var i = 0; i < hands.length; i++){
					M.hands.player.push({cards:M.parseCardSave(hands[i])});
					M.getHandValue(M.hands.player[i]);
				} 
			}else{
				M.hands.player = [{value:0, cards:[]}];
			}
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
			str += 'position: absolute; ';
			str += 'width: ' + (79 * 13) + 'px; ';
			str += 'height: ' + (123 * 5) + 'px; ';
			str += 'left: -' + left + 'px; ';
			str += 'top: -' + top + 'px; ';
			str += 'clip: rect(' + top + 'px ' + (left + 79) + 'px ' + (top + 123) + 'px ' + left + 'px);';
			return str;
		}
		
		M.cardImage2 = function(card){
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
			hand.cards.push(M.drawCard(M.Deck));
			M.getHandValue(hand);
			
			if(hand.value > 21){
				if(player){
					Game.Popup('Bust!', Game.mouseX, Game.mouseY);
					M.stand();
				}
			}
			
			M.buildTable();
		}
		
		M.doubledown = function(){
			Game.Spend(M.betAmount);
			M.betAmount *= 2;
			M.hit(M.hands.player[0], true);
			if(M.gameActive) M.stand();
		}
		
		M.stand = function(){
			if(M.currentPlayerHand >= (M.hands.player.length - 1)){
				var allBust = true;
				for(var i = 0; i < M.hands.player.length; i++) if(M.hands.player[i].value <= 21) allBust = false;
				
				if(allBust){
					M.evaluateHands();
				}else{
					M.isDealerTurn = 1;
					M.buildSidebar()
					M.determineHiddenDealerCard();
					M.buildTable();
					setTimeout(M.dealerTurn, 1000);
				}
				
			}else{
				M.currentPlayerHand++;
				M.buildTable();
			}
		}
		
		M.dealerTurn = function(){
			if(M.gameActive && M.hands.dealer.value < 17){
				M.hit(M.hands.dealer, false);
				M.buildTable();
				setTimeout(M.dealerTurn, 1000);
			}else{
				M.evaluateHands();
			}
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
			M.gameActive = 1;
			M.firstTurn = 1;
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
		
		M.instantWinChance = function(){
			return 1 - Math.pow(1 - 0.0005, M.parent.amount);
		}
		
		M.evaluateHands = function(){
			M.isDealerTurn = 0;
			for(var i = 0; i < M.hands.player.length; i++){
				if(M.hands.player[i].value > 21) M.endGame('bust');
				else if(M.hands.dealer.value > 21) M.endGame('dealerbust');
				else if(M.hands.dealer.value < M.hands.player[i].value) M.endGame('win');
				else if(M.hands.dealer.value > M.hands.player[i].value) M.endGame('lose');
				else if(M.hands.dealer.value == M.hands.player[i].value) M.endGame('push');
			}
		}
		
		M.endGame = function(mode){
			M.gameActive = 0;
			M.firstTurn = 0;
			var messg = '';
			var winnings = M.betAmount;
			
			switch(mode){
				case 'instantWin':
					winnings *= 2.5;
					messg = 'You make your own luck!';
					M.ownLuckWins++;
					break;
					
				case 'playerblackjack':
					winnings *= 2.5;
					messg = 'Blackjack!';
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
					messg = 'Victory!';
					break;
				
				case 'lose':
					winnings *= 0;
					messg = 'You lose';
					break;
					
				case 'push':
					winnings *= 0;
					messg = 'Tie goes to dealer';
					break;
					
				default:
					break;
			}
			
			if(winnings > 0){
				Game.Earn(winnings);
				M.wins++;
				M.winsT++;
				messg += '<br/>Gain ' + Beautify(Math.abs(winnings)) + ' cookies!';
			}
			
			
			Game.Notify(messg, '', '');
			M.buildSidebar();
		}
		
		M.toggleBetMode = function(){
			if(M.betMode == 1) M.betMode = 2;
			else if(M.betMode == 2) M.betMode = 3;
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
			str += '<div>Bet: ' + Beautify(M.betChoice) + ' <input type=button id="casinoBetModeToggle" value="' + mode + (M.betChoice == 1 ? '' : 's') + '" /> of CPS</div>';
			str += '<div id="casinoCurrentBet">(' + Beautify(M.betAmount) + ' cookies)</div>';
			M.moneyL.innerHTML = str;
			
			AddEvent(l('casinoBetModeToggle'), 'click', function(){return function(){PlaySound('snd/tick.mp3');M.toggleBetMode();}}()); 
			
			
			var str = '';
			str += '<div><input type=button id="casinoDeal" value="Deal" /></div>';
			str += '<div><input type=button id="casinoHit" value="Hit" /></div>';
			str += '<div><input type=button id="casinoDoubledown" value="Double Down" /></div>';
			str += '<div><input type=button id="casinoStand" value="Stand" /></div>';
			M.actionsL.innerHTML = str;
			
			l('casinoDeal').disabled = M.gameActive;
			l('casinoHit').disabled = (!M.gameActive || M.isDealerTurn);
			l('casinoStand').disabled = (!M.gameActive || M.isDealerTurn);
			AddEvent(l('casinoHit'), 'click', function(){return function(){PlaySound('snd/tick.mp3');M.firstTurn = 0;M.hit(M.hands.player[M.currentPlayerHand], true);}}()); 
			AddEvent(l('casinoStand'), 'click', function(){return function(){PlaySound('snd/tick.mp3');M.firstTurn = 0;M.stand();}}()); 
			AddEvent(l('casinoDoubledown'), 'click', function(){return function(){PlaySound('snd/tick.mp3');M.firstTurn = 0;M.doubledown();}}()); 
			AddEvent(l('casinoDeal'), 'click', function(){return function(){PlaySound('snd/tick.mp3');M.newGame();}}()); 
		}
		
		M.buildTable = function(){
			var str = '<table id="casinoBJTable">';
			str += '<tr><td>Dealer\'s hand:</td>';
			//for(var i = 0; i < M.hands.dealer.cards.length; i++) str += '<td><div class="casinoBJCardImage"><img src="' + M.cardsImage + '" style="' + M.cardImage(M.hands.dealer.cards[i]) + '"/></div></td>';
			for(var i = 0; i < M.hands.dealer.cards.length; i++) str += '<td><div class="casinoBJCardImage" style="background-image:url(' + M.cardsImage + '); background-position:' + M.cardImage2(M.hands.dealer.cards[i]) + ';" /></td>';
			str += '</tr>';
			str += '<tr style="height:75px;"><td></td></tr>';
			str += '<tr><td>Player\'s hand' + (M.hands.player.length > 1 ? (' (' + (M.currentPlayerHand + 1) + ' of ' + M.hands.player.length + ')') : '') + ':</td>'
			for(var i = 0; i < M.hands.player[M.currentPlayerHand].cards.length; i++) str += '<td><div class="casinoBJCardImage" style="background-image:url(' + M.cardsImage + '); background-position:' + M.cardImage2(M.hands.player[M.currentPlayerHand].cards[i]) + ';" /></td>';
			//for(var i = 0; i < M.hands.player[M.currentPlayerHand].cards.length; i++) str += '<td><div class="casinoBJCardImage"><img src="' + M.cardsImage + '" style="' + M.cardImage(M.hands.player[M.currentPlayerHand].cards[i]) + '"/></div></td>';
			str += '</tr>';
			str += '</table>';
			
			M.gameL.innerHTML = str;
		}
		
		var str = '';
		str += '<style>' + 
		'#casinoBG{background:url(img/shadedBorders.png), url(' + M.sourceFolder + 'img/BGcasino.jpg); background-size:100% 100%, auto; position:absolute; left:0px; right:0px; top:0px; bottom:16px;}' + 
		'#casinoContent{position:relative; box-sizing:border-box; padding:4px 24px; height:500px;}' +
		'#casinoSidebar{text-align:center; margin:0px; padding:0px; position:absolute; left:4px; top:4px; bottom:4px; right:65%; overflow-y:auto; overflow-x:hidden; box-shadow:8px 0px 8px rgba(0,0,0,0.5);}' +
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
		var str = '';
		str += parseInt(M.wins);
		str += ' ' + parseInt(M.winsT);
		str += ' ' + parseInt(M.ownLuckWins);
		str += ' ' + parseInt(M.betMode);
		str += ' ' + parseInt(M.firstTurn);
		str += ' ' + M.getCardSave(M.Deck);
		str += ' ' + M.getCardSave(M.hands.dealer.cards);
		str += ' ' + M.getPlayerHandsSave();
		str += ' ' + parseInt(M.bank);
		str += ' ' + parseInt(M.gameActive);
		str += ' ' + parseInt(M.parent.onMinigame ? '1' : '0');
		
		localStorage.setItem(M.savePrefix, str);
		return str;
	}
	
	M.load = function(str){
		//interpret str; called after .init
		//note : not actually called in the Game's load; see "minigameSave" in main.js
		if(!str) return false;
		
		var i = 0;
		var spl = str.split(' ');
		M.wins = parseInt(spl[i++] || 0);
		M.winsT = parseInt(spl[i++] || 0);
		M.ownLuckWins = parseInt(spl[i++] || 0);
		M.betMode = parseInt(spl[i++] || 0);
		M.firstTurn = parseInt(spl[i++] || 0);
		M.Deck = M.parseCardSave(spl[i++] || 0);
		M.hands.dealer = {cards:M.parseCardSave(spl[i++] || 0)};
		M.getHandValue(M.hands.dealer);
		M.parsePlayerHandsSave(spl[i++] || 0);
		M.bank = parseInt(spl[i++] || 1000);
		M.gameActive = parseInt(spl[i++] || 0);
		var on = parseInt(spl[i++] || 0);
		
		if(M.Deck.length < (M.minDecks * 52)) M.reshuffle();
		if(on && Game.ascensionMode != 1) M.parent.switchMinigame(1);
		
		M.buildSidebar();
		M.buildTable();
	}
	
	M.reset = function(){
		M.deckCount = 4;
		M.Deck = [];
		M.hands = {dealer:{value:0, cards:[]}, player:[{value:0, cards:[]}]};
		M.currentPlayerHand = 0;
		M.gameActive = 0;
		M.minDecks = 2;
		M.betAmount = 0;
		M.betChoice = 1;
		M.betMode = 1;
		M.wins = 0;
		M.ownLuckWins = 0;
		M.firstTurn = 0;
		
		M.reshuffle();
		
		M.buildSidebar();
		M.buildTable();
		
		setTimeout(function(M){return function(){M.onResize();}}(M), 10);
	}
	
	M.logic = function(){
		//run each frame
		if(M.betMode == 1 && !M.gameActive){
			M.betAmount = Math.min(Game.cookies, Game.cookiesPs * M.betChoice);
		}else if(M.betMode == 2 && !M.gameActive){
			M.betAmount = Math.min(Game.cookies, Game.cookiesPs * M.betChoice * 60);
		}else if(M.betMode == 3 && !M.gameActive){
			M.betAmount = Math.min(Game.cookies, Game.cookiesPs * M.betChoice * 60 * 60);
		}
		
		l('casinoDoubledown').disabled = !(M.firstTurn && Game.cookies >= M.betAmount);
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