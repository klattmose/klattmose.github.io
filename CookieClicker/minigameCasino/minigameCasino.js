var M = {};
M.parent = Game.Objects['Chancemaker'];
M.parent.minigame = M;

M.launch = function(){
	var M = this;
	M.name = M.parent.minigameName;
	M.savePrefix = 'minigameCasino';
	M.sourceFolder = '../minigameCasino/';
	M.cardsImage = M.sourceFolder + 'img/cards.png'
	
	M.init = function(div){
		// It's possible that the save data might get lost if entrusted to the game's save
		if(!M.parent.minigameSave && localStorage.getItem(M.savePrefix) != null) M.parent.minigameSave = localStorage.getItem(M.savePrefix);
		
		M.cards = [];
		M.cards.push({pip: 0, value:0, suit: 0});
		for(var j = 0; j < 4; j++) for(var i = 1; i <= 13; i++) M.cards.push({pip: i, value: (i < 10 ? i : 10), suit: j});
		
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
		
		M.hit = function(hand, player){
			hand.cards.push(M.drawCard(M.Deck));
			M.getHandValue(hand);
			
			if(hand.value > 21){
				if(player){
					Game.Popup('Bust!');
					M.stand();
				}
			}
			
			M.buildTable();
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
			
			M.hit(M.hands.player[0], true);
			M.hit(M.hands.dealer, false);
			M.hit(M.hands.player[0], true);
			M.hit(M.hands.dealer, false);
			
			if(M.hands.player[0].value == 21){
				M.endGame('playerblackjack');
				M.Deck.push(M.hands.dealer.cards[1]);
				M.hands.dealer.cards[1] = M.cards[0];
			} else if(M.hands.dealer.value == 21){
				M.endGame('dealerblackjack');
			} else{
				M.Deck.push(M.hands.dealer.cards[1]);
				M.hands.dealer.cards[1] = M.cards[0];
			}
			
			M.buildSidebar();
			M.buildTable();
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
			var messg = '';
			var winnings = M.bet;
			
			switch(mode){
				case 'playerblackjack':
					winnings *= 1.5;
					messg = 'Blackjack!';
					break;
					
				case 'dealerblackjack':
					winnings *= -1;
					messg = 'Dealer blackjack';
					break;
				
				case 'bust':
					winnings *= -1;
					messg = 'Over 21!';
					break;
				
				case 'dealerbust':
					messg = 'Dealer went over 21!';
					break;
				
				case 'win':
					messg = 'Victory!';
					break;
				
				case 'lose':
					winnings *= -1;
					messg = 'You lose';
					break;
					
				case 'push':
					winnings *= -1;
					messg = 'Tie goes to dealer';
					break;
					
				default:
					break;
			}
			
			messg += '<br/>' + (winnings < 0 ? 'Lose' : 'Gain') + ' $' + Math.abs(winnings) + '!';
			M.bank += winnings;
			Game.Notify(messg, '', '');
			M.buildSidebar();
		}
		
		
		
		M.buildSidebar = function(){
			var str = '';
			str += '<div><input type=button id="casinoDeal" value="Deal" ' + (M.gameActive ? 'disabled="" ' : '') + '/></div>';
			str += '<div><input type=button id="casinoHit" value="Hit" ' + ((M.gameActive && !M.isDealerTurn) ? '' : 'disabled="" ') + '/></div>';
			str += '<div><input type=button id="casinoStand" value="Stand" ' + ((M.gameActive && !M.isDealerTurn) ? '' : 'disabled="" ') + '/></div>';
			M.actionsL.innerHTML = str;
			
			var str = '';
			str += '<div>Bank: $' + M.bank + '</div>';
			str += '<div>Bet: $' + M.bet + '</div>';
			M.moneyL.innerHTML = str;
			
			AddEvent(l('casinoHit'), 'click', function(){return function(){PlaySound('snd/tick.mp3');M.hit(M.hands.player[M.currentPlayerHand], true);}}()); 
			AddEvent(l('casinoStand'), 'click', function(){return function(){PlaySound('snd/tick.mp3');M.stand();}}()); 
			AddEvent(l('casinoDeal'), 'click', function(){return function(){PlaySound('snd/tick.mp3');M.newGame();}}()); 
		}
		
		M.buildTable = function(){
			var str = '<table id="casinoBJTable">';
			str += '<tr><td>Dealer\'s hand:</td>';
			for(var i = 0; i < M.hands.dealer.cards.length; i++) str += '<td><div class="casinoBJCardImage"><img src="' + M.cardsImage + '" style="' + M.cardImage(M.hands.dealer.cards[i]) + '"/></div></td>';
			str += '</tr>';
			str += '<tr style="height:75px;"><td></td></tr>';
			str += '<tr><td>Player\'s hand' + (M.hands.player.length > 1 ? (' (' + (M.currentPlayerHand + 1) + ' of ' + M.hands.player.length + ')') : '') + ':</td>'
			for(var i = 0; i < M.hands.player[M.currentPlayerHand].cards.length; i++) str += '<td><div class="casinoBJCardImage"><img src="' + M.cardsImage + '" style="' + M.cardImage(M.hands.player[M.currentPlayerHand].cards[i]) + '"/></div></td>';
			str += '</tr>';
			str += '</table>';
			
			M.gameL.innerHTML = str;
		}
		
		var str = '';
		str += '<style>' + 
		'#casinoBG{background:url(img/shadedBorders.png), url(../minigameCasino/img/BGcasino.jpg); background-size:100% 100%, auto; position:absolute; left:0px; right:0px; top:0px; bottom:16px;}' + 
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
		str = M.getCardSave(M.Deck);
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
		M.bank = 1000;
		M.bet = 100;
		
		M.reshuffle();
		
		M.buildSidebar();
		M.buildTable();
		
		setTimeout(function(M){return function(){M.onResize();}}(M), 10);
	}
	
	M.logic = function(){
		//run each frame
		
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
		
	}
	
	M.init(l('rowSpecial' + M.parent.id));
}
//var M = 0;