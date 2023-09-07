if(Game.Objects['Chancemaker'].minigame) throw new Error("Casino prevented from loading by already present Chancemaker minigame.");

if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (0 ? 'Beta/' : '') + 'CCSE.js');
var M = {};
M.parent = Game.Objects['Chancemaker'];
M.parent.minigame = M;
M.loadedCount = 0;
M.bankPercentage = false;
M.version = '4.3';
M.GameVersion = '2.052';

M.launch = function(){
	var M = this;

	const MINUTE = 60;
	const HOUR = 60 * 60;
	const DAY = 60 * 60 * 24;
	const MONTH = 60 * 60 * 24 * 30;
	const DECADE = 60 * 60 * 24 * 365.26 * 10;
	const MILLENNIUM = 60 * 60 * 24 * 365.26 * 1000;
	
	M.init = function(div){
		// It's possible that the save data might get lost if entrusted to the game's save
		if(localStorage.getItem(M.savePrefix) != null && !CCSE.config.OtherMods[M.name]) CCSE.config.OtherMods[M.name] = localStorage.getItem(M.savePrefix); // Import old version that doesn't use CCSE if necessary
		if(!M.parent.minigameSave && CCSE.config.OtherMods[M.name]) M.parent.minigameSave = CCSE.config.OtherMods[M.name];
		M.saveString = M.parent.minigameSave;
		M.div = div;
		
		
		//***********************************
		//    Initial support for multiple games
		//***********************************
		M.games = {
			choice: 0,
			Blackjack: {}
		}
		
		M.cards = [];
		M.cards.push({pip: 0, value:0, suit: 0});
		for(var j = 0; j < 4; j++) for(var i = 1; i <= 13; i++) M.cards.push({pip: i, value: (i < 10 ? i : 10), suit: j});
		
		M.reshuffle = function(){
			M.Deck = [];
			for(var i = 0; i < M.deckCount; i++) for(var j = 1; j < M.cards.length; j++) M.Deck.push(M.cards[j]);
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
		
		M.buildSidebar = function(){
			if(M.games.choice == 0) M.games.Blackjack.buildSidebar();
		}
		
		M.buildTable = function(){
			if(M.games.choice == 0) M.games.Blackjack.buildTable();
		}
		
		M.formatPercentage = function(value) {
			if(!M.percentagePrecision) {
				return value * 100 + '%';
			} else {
				var sign = (value < 0 ? '-' : '');
				value = Math.abs(value);
				if(value < M.minPercentage) {
					if(sign) {
						return '-' + M.minPercentageStr + 'to 0%';
					} else {
						return '<' + M.minPercentageStr;
					}
				} else {
					// Decided on floor instead of round, it is more similar to the expectations
					value = Math.round(value * 100 * M.percentagePow10);
					var low = value % M.percentagePow10;
					var low_digits = M.percentagePrecision;
					while(low > 0 && low % 10 === 0) {
						low /= 10;
						low_digits -= 1;
					}
					if(low) {
						low = '' + low;
						while(low.length < low_digits) {
							low = '0' + low;
						}
						low = '.' + low;
					} else {
						low = '';
					}
					var high = Math.floor(value / M.percentagePow10);
					return sign + high + low + '%';
				}
			}
		}
		
		M.setPercentagePrecision = function(precision) {
			if(precision < 0) {
				throw "In setPercentagePrecision: precision must be >= 0, got " + precision;
			} else {
				M.percentagePrecision = precision;
				if(!precision) {
					M.minPercentage = null;
					M.minPercentageStr = null;
					M.percentagePow10 = null;
			   } else {
					M.minPercentage = Math.pow(10, -precision - 2);
					M.minPercentageStr = '' + Math.pow(10, -precision) + '%';
					M.percentagePow10 = Math.pow(10, precision);
			   }       
			}
		}
		
		
		//***********************************
		//    Blackjack
		//***********************************
		M.games.Blackjack = {
			wins : 0,
			winsT : 0,
			losses : 0,
			tiesLost : 0,
			ownLuckWins : 0,
			doubleDown : 0,
			splits : 0,
			splitsT : 0,
			netTotal : 0,
			
			phases : {
				inactive: 0,
				deal: 1,
				firstTurn: 2,
				playerTurn: 3,
				dealerTurn: 4,
				evaluate: 5,
				surrender: 6
			},
			
			getHandValue : function(hand){
				hand.value = 0;
				for(var i = 0; i < hand.cards.length; i++) hand.value += hand.cards[i].value;
				for(var i = 0; i < hand.cards.length; i++) if(hand.value <= 11 && hand.cards[i].value == 1) hand.value += 10;
			},
			
			drawCard : function(deck){
				var i = Math.floor(Math.random() * deck.length);
				var res = deck[i];
				deck.splice(i, 1);
				
				if(M.Deck.length < (M.minDecks * 52)){
					Game.Unlock('Counting cards');
					M.reshuffle();
					Game.Popup('Decks reshuffled!', Game.mouseX, Game.mouseY);
				}
				return res;
			},
			
			hit : function(hand, player){
				this.getHandValue(hand);
				var oldValue = hand.value;
				hand.cards.push(this.drawCard(M.Deck));
				this.getHandValue(hand);
				
				if(hand.value > 21){
					if(player){
						Game.Unlock('Math lessons');
						this.stand();
					}
				} else if(player && oldValue >= 17 && hand.value > oldValue){
					Game.Win('I like to live dangerously');
				}
				
				this.buildTable();
			},
			
			doubledown : function(){
				Game.Spend(M.betAmount);
				M.games.Blackjack.doubleDown++;
				M.hands.player[M.currentPlayerHand].betMultiplier = 2;
				this.hit(M.hands.player[M.currentPlayerHand], true);
				this.stand();
			},
			
			split : function(){
				Game.Spend(M.betAmount);
				
				let splitAces = M.hands.player[0].cards[0] == 1;
				M.hands.player.push({value:0, cards:[]});
				M.hands.player[1].cards.push(M.hands.player[0].cards[1]);
				M.hands.player[0].cards.splice(1, 1);
				M.hands.player[0].splitFirstTurn = true;
				M.hands.player[1].splitFirstTurn = true;
				M.games.Blackjack.splits += 2;
				M.games.Blackjack.splitsT++;

				this.hit(M.hands.player[0], true);
				this.hit(M.hands.player[1], true);
				for (i = 0; i < 2; i++)
					if (M.hands.player[i].value == 21 || M.hands.player[i].cards.length == 2 && Game.Has('Strong split aces') == false && splitAces) {
						Game.tooltip.shouldHide = 1;
						M.currentPlayerHand = i;
						M.games.Blackjack.phase = M.games.Blackjack.phases.playerTurn;
						M.games.Blackjack.stand();
					} else {
						this.buildSidebar();
						this.buildTable();
					}
				if(!Game.Has('Strong split aces') && M.games.Blackjack.splitsT >= 5) Game.Unlock('Strong split aces');
			},
			
			surrender : function() {
				this.phase = this.phases.surrender;
				M.nextBeat = Date.now() + M.beatLength;
				this.buildSidebar();
				this.buildTable();
			},
			
			stand : function(){
				if(M.currentPlayerHand >= (M.hands.player.length - 1)){
					var allBust = true;
					for(var i = 0; i < M.hands.player.length; i++) if(M.hands.player[i].value <= 21) allBust = false;
					
					if(allBust){
						M.nextBeat = Date.now() + M.beatLength;
						this.phase = this.phases.evaluate;
					}else{
						M.hands.dealer.cards[1] = this.hiddenCard;
						this.getHandValue(M.hands.dealer);
						this.phase = this.phases.dealerTurn;
						if(M.hands.dealer.value >= 17){
							M.currentPlayerHand = 0;
							this.phase = this.phases.evaluate;
						}
						M.nextBeat = Date.now() + M.beatLength;
					}
					
				}else{
					M.nextBeat = Date.now() + M.beatLength;
					M.currentPlayerHand++;
				}
				
				this.buildSidebar();
				this.buildTable();
			},
			
			instantWinChance : function(){ return (Game.Has('I make my own luck') ? Math.min(1 - Math.pow(1 - M.chancemakerChance * (Game.Has('Infinite Improbability Drive') ? 2 : 1), M.parent.amount), .26) : 0); },
			
			toggleBetMode : function(){
				if(M.betMode == 1 && Game.Has('Raise the stakes')) M.betMode = 2;
				else if(M.betMode < 3 && Game.Has('High roller!')) M.betMode = 3;
				else if(M.betMode < 4 && Game.Has('Big spender!')) M.betMode = 4;
				else if(M.betMode < 5 && Game.Has('Main player')) M.betMode = 5;
				else if(M.betMode < 6 && Game.Has('True gambler')) M.betMode = 6;
				else if(M.betMode < 7 && Game.Has('Immortal bettor')) M.betMode = 7;
				else M.betMode = 1;
				
				this.buildSidebar();
			},
			
			toggleBetChoice : function(){
				if(M.betChoice == 1 && Game.Has('Double or nothing')) M.betChoice = 2;
				else if(M.betChoice < 3 && Game.Has('Stoned cows')) M.betChoice = 5;
				else if(M.betChoice < 10 && Game.Has('Game for Pros')) M.betChoice = 20;
				else M.betChoice = 1;
				
				this.buildSidebar();
			},
			
			dealProbabilities : function(){
				var res = '<div style="padding:8px 4px; min-width:125px;">';
				var iwc = M.games.Blackjack.instantWinChance();
				var chances = [];
				var cards = [];
				var possibles = M.Deck.length * (M.Deck.length - 1) / 2;
				
				for(var i = 4; i <= 21; i++) chances[i] = 0;
				for(var i = 1; i <= 10; i++) cards[i] = 0;
				
				for(var i = 0; i < M.Deck.length; i++){
					var card = M.Deck[i];
					cards[card.value]++;
				}
				
				for(var i = 1; i <= 10; i++)
				for(var j = 1; j <= 10; j++){
					var val = j + i;
					if(i == 1 || j == 1) val += 10;
					chances[val] += cards[i] * (cards[j] + (i == j ? -1 : 0)) / possibles / 2;
				}
				
				chances[21] = 1 - (1 - chances[21]) * (1 - iwc);
				for(var i = 4; i <= 20; i++) chances[i] *= 1 - iwc;
				
				if(chances[21] != 0) res += '<b>Blackjack : </b>' + M.formatPercentage(chances[21]) + '<br/>';
				for(var i = 20; i >= 4; i--) if(chances[i] != 0) res += '<b>' + i + ' : </b>' + M.formatPercentage(chances[i]) + '<br/>';
				
				return res + '</div>';
			},
			
			drawProbabilities : function(){
				var res = '<div style="padding:8px 4px; min-width:125px;">';
				var cards = [];
				var outcomes = [];
				outcomes[22] = 0;
				
				for(var i = 1; i <= 10; i++) cards[i] = 0;
				for(var i = 0; i < M.Deck.length; i++){
					var card = M.Deck[i];
					cards[card.value]++;
				}
				cards[M.games.Blackjack.hiddenCard.value]++;
				
				for(var i = 1; i <= 10; i++){
					var prob = cards[i] / (M.Deck.length + 1);
					var value = 0;
					var hand = M.hands.player[M.currentPlayerHand];
					
					for(var j = 0; j < hand.cards.length; j++) value += hand.cards[j].value;
					value += i;
					if(value <= 11 && i == 1) value += 10;
					for(var j = 0; j < hand.cards.length; j++) if(value <= 11 && hand.cards[j].value == 1) value += 10;
					
					if(value > 21) outcomes[22] += prob;
					else outcomes[value] = prob;
				}
				
				if(outcomes[22]) res += '<b>Bust : </b>' + M.formatPercentage(outcomes[22]) + '<br/>';
				for(var i = 21; i > 5; i--) if(outcomes[i]) res += '<b>' + i + ' : </b>' + M.formatPercentage(outcomes[i]) + '<br/>';
				
				return res + '</div>';
			},
			
			standProbabilities : function(){
				var res = '<div style="padding:8px 4px; min-width:125px;">';
				var cards = [];
				var outcomes = [];
				var simHand = [];
				var winChance = 0;
				var lossChance = 0;
				
				for(var i = 0; i < M.hands.dealer.cards.length; i++) if(M.hands.dealer.cards[i].value) simHand.push(M.hands.dealer.cards[i].value);
				for(var i = 17; i <= 22; i++) outcomes[i] = 0;
				
				for(var i = 1; i <= 10; i++) cards[i] = 0;
				for(var i = 0; i < M.Deck.length; i++){
					var card = M.Deck[i];
					cards[card.value]++;
				}
				cards[M.games.Blackjack.hiddenCard.value]++;
				
				M.games.Blackjack.recursiveDealerSim(cards, outcomes, simHand, M.Deck.length + 1, 1);
				
				winChance += outcomes[22];
				if (Game.Has('Tiebreaker') || !Game.Has('Standard push'))
					for(var i = 21; i >= 17; i--) if(i >= M.hands.player[M.currentPlayerHand].value + (Game.Has('Tiebreaker') ? 1 : 0)) lossChance += outcomes[i]; else winChance += outcomes[i];
				if(winChance) res += '<b>Win : </b><span class="green">' + M.formatPercentage(winChance) + '</span><br/>'
				if(lossChance) res += '<b>Lose : </b><span class="red">' + M.formatPercentage(lossChance) + '</span><br/>'
				
				if(outcomes[22]) res += '<br/><b>Dealer chances</b><br/><br/><b>Bust : </b>' + M.formatPercentage(outcomes[22]) + '<br/>';
				for(var i = 21; i >= 17; i--) if(outcomes[i]) res += '<b>' + i + ' : </b>' + M.formatPercentage(outcomes[i]) + '<br/>';
				
				return res + '</div>';
			},
			
			recursiveDealerSim : function(cards, outcomes, simHand, deckLength, stateChance){
				for(var i = 1; i <= 10; i++){
					if(cards[i]){
						simHand.push(i);
						
						var value = 0;
						var chance = stateChance * cards[i] / deckLength;
						for(var j = 0; j < simHand.length; j++) value += simHand[j];
						for(var j = 0; j < simHand.length; j++) if(value <= 11 && simHand[j] == 1) value += 10;
						
						if(value > 21) value = 22;
						if(value >= 17){
							outcomes[value] += chance;
						}
						else{
							cards[i]--;
							M.games.Blackjack.recursiveDealerSim(cards, outcomes, simHand, deckLength - 1, chance);
							cards[i]++;
						}
						
						simHand.splice(simHand.length - 1);
					}
				}
			},
			
			buildSidebar : function(){
				let betTime;
				let mode = '';
				
				if(M.betMode == 1){
					mode = 'second';
					betTime = 1;
				}else if(M.betMode == 2){
					mode = 'minute';
					betTime = MINUTE;
				}else if(M.betMode == 3){
					mode = 'hour';
					betTime = HOUR;
				}else if(M.betMode == 4){
					mode = 'day';
					betTime = DAY;
				}else if(M.betMode == 5){
					mode = 'month';
					betTime = MONTH;
				}else if(M.betMode == 6){
					mode = 'decade';
					betTime = DECADE;
				}else if(M.betMode==7){
					mode='millenni';
					betTime=MILLENNIUM;
				}
				if(M.bankPercentage==true)
					M.betAmount=Math.min(Game.cookies*M.betChoice/1000,Game.cookiesPsRawHighest*20*MILLENNIUM);
				else
					M.betAmount=Math.min(Game.cookies*.02,Game.cookiesPsRawHighest*M.betChoice*betTime);
				
				var str = '';
				var strBet;
				
				if (M.bankPercentage == true)
					strBet = Beautify(M.betChoice / 10, 1);
				else
					strBet = Beautify(M.betChoice);
				
				if(Game.Has('Double or nothing') || Game.Has('Stoned cows') || Game.Has('Game for Pros'))
					str += '<div>Bet: <a class="option" id="casinoBetChoiceToggle" >' + strBet + '</a> ';
				else str += '<div>Bet: ' + strBet + ' ';
				
				if (M.bankPercentage == true)
					str += 'percent of bank</div>';
				else if(Game.Has('Raise the stakes') || Game.Has('High roller!') || Game.Has('Big spender!') || Game.Has('Main player') || Game.Has('True gambler') || Game.Has('Immortal Bettor')) str += '<a class="option" id="casinoBetModeToggle" >' + mode + (mode == 'millenni' ? (strBet == '1' ? 'um' : 'a') : (strBet == '1' ? '' : 's')) + '</a> of CPS</div>';
				else str += mode + (strBet == '1' ? '' : 's') + ' of CPS</div>';
				
				let maxTime = Math.min(Game.cookies * M.betChoice / 1000, Game.cookiesPsRawHighest * 20 * MILLENNIUM);
				let betLimited = M.bankPercentage == true && maxTime != Game.cookies * M.betChoice / 1000 || M.bankPercentage == false && M.betAmount == Game.cookies * .02;

				if (betLimited == false) {
					str += '<div id="casinoCurrentBet">(' + Beautify(M.betAmount);
				} else if (M.bankPercentage == true) {
					str += '<div>(' + Beautify(Game.cookies * M.betChoice / 1000);
				} else {
					str += '<div>(' + Beautify(Game.cookiesPsRawHighest * M.betChoice * betTime);
				}
				str += ' cookies)</div>';
				if (betLimited == true) {
					str += '<div><br>Maximum bet limit reached</div>';
					if (M.bankPercentage == true) {
						str += `<div>Actual bet:  <b>${Beautify(maxTime / (Game.cookies / 100), (maxTime == Game.cookies * M.betChoice / 1000 ? 1 : 3))}%</b>`;
					} else {
						str += `<div>Actual bet:  <b>${Beautify(M.betAmount / (Game.cookiesPsRawHighest * betTime), 3)}  ${mode}${mode == 'millenni' ? (M.betChoice == '1' ? 'um' : 'a') : (M.betChoice == '1' ? '' : 's')}</b>`;
					}
				str += '<div id="casinoCurrentBet">(' + Beautify(M.betAmount) + ' cookies)</div>';
				 					str += '<    /div>';
				}
				M.moneyL.innerHTML = str;
				
				var str = '<table class="casinoActionsTable">';
				if(this.phase == this.phases.inactive) str += '<tr><td><div class="listing"><a class="option" id="casinoDeal" >Deal</a></div></td></tr>';
				else str += '<tr><td><div class="listing">Deal</div></td></tr>';
				if(this.phase == this.phases.firstTurn || this.phase == this.phases.playerTurn) str += '<tr><td><div class="listing"><a class="option" id="casinoHit" >Hit</a></div></td></tr>';
				else str += '<tr><td><div class="listing">Hit</div></td></tr>';
				if((this.phase == this.phases.firstTurn || M.games.Blackjack.splits && Game.Has('Double down') && M.hands.player[M.currentPlayerHand].splitFirstTurn) && Game.cookies >= M.betAmount) {
					str += '<tr><td><div class="listing"><a class="option" id="casinoDoubledown" >Double Down</a></div></td></tr>';
				} else str += '<tr><td><div class="listing">Double Down</div></td></tr>';
				if(this.phase == this.phases.firstTurn && Game.cookies >= M.betAmount && M.hands.player[0].cards[0].pip == M.hands.player[0].cards[1].pip) str += '<tr><td><div class="listing"><a class="option" id="casinoSplit" >Split</a></div></td></tr>';
				else str += '<tr><td><div class="listing">Split</div></td></tr>';
				if(Game.Has('Surrender') && this.phase == this.phases.firstTurn || M.games.Blackjack.splits && M.hands.player[M.currentPlayerHand].splitFirstTurn) {
					str += '<tr><td><div class="listing"><a class="option" id="casinoSurrender" >Surrender</a></div></td></tr>';
				}else str += '<tr><td><div class="listing">Surrender</div></td></tr>';
				if(this.phase == this.phases.firstTurn || this.phase == this.phases.playerTurn) str += '<tr><td><div class="listing"><a class="option" id="casinoStand" >Stand</a></div></td></tr>';
				else str += '<tr><td><div class="listing">Stand</div></td></tr>';
				str += '</table>';
				M.actionsL.innerHTML = str;
				
				
				
				if(l('casinoBetChoiceToggle')) AddEvent(l('casinoBetChoiceToggle'), 'click', function(){return function(){
					PlaySound('snd/tick.mp3');
					M.games.Blackjack.toggleBetChoice();
				}}()); 
				if(l('casinoBetModeToggle')) AddEvent(l('casinoBetModeToggle'), 'click', function(){return function(){
					PlaySound('snd/tick.mp3');
					M.games.Blackjack.toggleBetMode();
				}}()); 
				if(l('casinoDeal')) AddEvent(l('casinoDeal'), 'click', function(){return function(){
					PlaySound('snd/tick.mp3');
					Game.tooltip.shouldHide = 1;
					M.games.Blackjack.istep = 0;
					M.games.Blackjack.phase = M.games.Blackjack.phases.deal;
					M.nextBeat = Date.now();
				}}()); 
				if(l('casinoHit')) AddEvent(l('casinoHit'), 'click', function(){return function(){
					PlaySound('snd/tick.mp3');
					Game.tooltip.shouldHide = 1;
					M.games.Blackjack.phase = M.games.Blackjack.phases.playerTurn;
					M.games.Blackjack.hit(M.hands.player[M.currentPlayerHand], true);
					M.hands.player[M.currentPlayerHand].splitFirstTurn = false;
					if (M.hands.player[M.currentPlayerHand].value == 21) {
						Game.tooltip.shouldHide = 1;
						M.games.Blackjack.phase = M.games.Blackjack.phases.playerTurn;
						M.games.Blackjack.stand();
					} else
						M.games.Blackjack.buildSidebar();
				}}()); 
				if(l('casinoDoubledown')) AddEvent(l('casinoDoubledown'), 'click', function(){return function(){
					PlaySound('snd/tick.mp3');
					Game.tooltip.shouldHide = 1;
					M.games.Blackjack.phase = M.games.Blackjack.phases.playerTurn;
					M.games.Blackjack.doubledown();
				}}()); 
				if(l('casinoSplit')) AddEvent(l('casinoSplit'), 'click', function(){return function(){
					PlaySound('snd/tick.mp3');
					Game.tooltip.shouldHide = 1;
					M.games.Blackjack.phase = M.games.Blackjack.phases.playerTurn;
					M.games.Blackjack.split();
				}}()); 
				if(l('casinoSurrender')) AddEvent(l('casinoSurrender'), 'click', function(){return function(){
					PlaySound('snd/tick.mp3');
					Game.tooltip.shouldHide = 1;
					M.games.Blackjack.phase = M.games.Blackjack.phases.playerTurn;
					M.games.Blackjack.surrender();
				}}()); 
				if(l('casinoStand')) AddEvent(l('casinoStand'), 'click', function(){return function(){
					PlaySound('snd/tick.mp3');
					Game.tooltip.shouldHide = 1;
					M.games.Blackjack.phase = M.games.Blackjack.phases.playerTurn;
					M.games.Blackjack.stand();
				}}()); 
				
				if(Game.Has('Actually, do tell me the odds')){
					if(l('casinoDeal')) Game.attachTooltip(l('casinoDeal'), this.dealProbabilities, 'this');
					if(l('casinoHit')) Game.attachTooltip(l('casinoHit'), this.drawProbabilities, 'this');
					if(l('casinoDoubledown')) Game.attachTooltip(l('casinoDoubledown'), this.drawProbabilities, 'this');
					//if(l('casinoSplit')) Game.attachTooltip(l('casinoSplit'), this.drawProbabilities, 'this');
					if(l('casinoSurrender')) Game.attachTooltip(l('casinoSurrender'), this.standProbabilities, 'this');
					if(l('casinoStand')) Game.attachTooltip(l('casinoStand'), this.standProbabilities, 'this');
				}
			},
			
			buildTable : function(){
				this.getHandValue(M.hands.dealer);
				this.getHandValue(M.hands.player[M.currentPlayerHand]);
				
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
				
				
				var cardCount = 0;
				for(var i = 0; i < M.Deck.length; i++){
					if(M.Deck[i].value >= 2 && M.Deck[i].value <= 6) cardCount--;
					else if(M.Deck[i].value == 1 || M.Deck[i].value >= 10) cardCount++;
				}
				if(this.hiddenCard && M.hands.dealer.cards[1] && M.hands.dealer.cards[1].value == 0){
					if(this.hiddenCard.value >= 2 && this.hiddenCard.value <= 6) cardCount--;
					else if(this.hiddenCard.value == 1 || this.hiddenCard.value >= 10) cardCount++;
				}
				M.infoL.innerHTML = 'Hands won : ' + Beautify(this.wins) + ' (total : ' + Beautify(this.winsT) + ')' + (Game.Has('Counting cards') ? ('<br/>Cards left in deck : ' + M.Deck.length + '<br/>Count : ' + cardCount) : '');
				
			},
			
			logic : function(){
				//run each frame
				if (this.phase == this.phases.inactive) {
					if (M.bankPercentage == true) {
						M.betAmount = Math.min(Game.cookies * M.betChoice / 1000, Game.cookiesPsRawHighest * 20 * MILLENNIUM);
					} else {
						if(M.betMode == 1){
							M.betAmount = Math.min(Game.cookies * .02, Game.cookiesPsRawHighest * M.betChoice);
						}else if(M.betMode == 2){
							M.betAmount = Math.min(Game.cookies * .02, Game.cookiesPsRawHighest * M.betChoice * MINUTE);
						}else if(M.betMode == 3){
							M.betAmount = Math.min(Game.cookies * .02, Game.cookiesPsRawHighest * M.betChoice * HOUR);
						}else if(M.betMode == 4){
							M.betAmount = Math.min(Game.cookies * .02, Game.cookiesPsRawHighest * M.betChoice * DAY);
						}else if(M.betMode == 5){
							M.betAmount = Math.min(Game.cookies * .02, Game.cookiesPsRawHighest * M.betChoice * MONTH);
						}else if(M.betMode == 6){
							M.betAmount = Math.min(Game.cookies * .02, Game.cookiesPsRawHighest * M.betChoice * DECADE);
						}else if(M.betMode == 7){
							M.betAmount = Math.min(Game.cookies * .02, Game.cookiesPsRawHighest * M.betChoice * MILLENNIUM);
						}
					}
				}
				
				if(Date.now() > M.nextBeat){
					M.nextBeat = Date.now() + M.beatLength;
					var outcome = 0;
					
					if(this.phase == this.phases.inactive){
						
					}
					else if(this.phase == this.phases.deal){
						if(this.istep == 0){
							if(M.Deck.length < (M.minDecks * 52)) M.reshuffle();
							M.hands = {dealer:{value:0, cards:[]}, player:[{value:0, splitFirstTurn:true, betMultiplier:1, cards:[]}]};
							M.currentPlayerHand = 0;
							Game.Spend(M.betAmount);
							
							this.hit(M.hands.player[0], true);
							this.istep = 1;
						}
						else if(this.istep == 1){
							this.hit(M.hands.dealer, false);
							this.istep = 2;
						}
						else if(this.istep == 2){
							this.hit(M.hands.player[0], true);
							this.istep = 3;
						}
						else if(this.istep == 3){
							this.hit(M.hands.dealer, false);
							
							this.hiddenCard = M.hands.dealer.cards[1];
							M.hands.dealer.cards[1] = M.cards[0];
							
							this.phase = this.phases.firstTurn;
							if (M.games.Blackjack.splits) {
							} else if(M.hands.player[0].value == 21){
								M.hands.dealer.cards[1] = this.hiddenCard;
								outcome = 'playerblackjack';
								this.phase = this.phases.inactive;
								
							} else if((random = Math.random()) < (chance = this.instantWinChance())){
								M.hands.dealer.cards[1] = this.hiddenCard;
								
								M.hands.player[0].cards[0] = {pip:choose([10,11,12,13]), value:10, suit:choose([0,1,2,3])};
								M.hands.player[0].cards[1] = {pip:1, value:1, suit:choose([0,1,2,3])};
								
								outcome = 'instantWin';
								this.phase = this.phases.inactive;
								
							} else if(M.hands.dealer.value == 21){
								M.hands.dealer.cards[1] = this.hiddenCard;
								outcome = 'dealerblackjack';
								this.phase = this.phases.inactive;
								
							} else{
								
							}
						}
						
						this.buildTable();
						this.buildSidebar();
						M.hands.player[M.currentPlayerHand].splitFirstTurn = false;
					}
					else if(this.phase == this.phases.playerTurn || this.phase == this.phases.firstTurn){
					}
					else if(this.phase == this.phases.dealerTurn){
						if(M.hands.dealer.value < 17){
							this.hit(M.hands.dealer, false);
						}
						if(M.hands.dealer.value >= 17){
							M.currentPlayerHand = 0;
							this.phase = this.phases.evaluate;
						}
						
						this.buildTable();
						this.buildSidebar();
					}
					else if(this.phase == this.phases.evaluate){
						var playerHand = M.currentPlayerHand;
						M.hands.dealer.cards[1] = this.hiddenCard;
						this.buildTable();
						
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
							this.phase = this.phases.evaluate;
						} 
						else{
							this.phase = this.phases.inactive;
						}
						
						this.buildTable();
						this.buildSidebar();
					}
					else if(this.phase == this.phases.surrender){
						var playerHand = M.currentPlayerHand;
						M.hands.dealer.cards[1] = this.hiddenCard;
						this.buildTable();							
						outcome = 'surrender';
						playerHand++;
						if(playerHand < M.hands.player.length){
							M.currentPlayerHand = playerHand;
							this.phase = this.phases.evaluate;
						} 
						else{
							this.phase = this.phases.inactive;
						}
						this.buildTable();
						this.buildSidebar();
					}
					
					this.getHandValue(M.hands.dealer);
					this.getHandValue(M.hands.player[M.currentPlayerHand]);
					
					if(outcome){
						var messg = '';
						if (M.hands.player[M.currentPlayerHand].betMultiplier != 2) {
							M.hands.player[M.currentPlayerHand].betMultiplier = 1;
						}
						var winnings = M.betAmount * M.hands.player[M.currentPlayerHand].betMultiplier;
					
						M.hands.player[M.currentPlayerHand].betMultiplier = 1;
						switch(outcome){
							case 'instantWin':
								winnings *= 2.5;
								messg = 'You make your own luck!';
								this.ownLuckWins++;
								
								if(this.ownLuckWins >= 13) Game.Win('Ace up your sleeve');
								if(Game.Has('I make my own luck') && this.ownLuckWins >= 52) Game.Unlock('Infinite Improbability Drive');
								if(this.ownLuckWins >= (13 * 13)) Game.Win('Paid off the dealer');
								if(this.ownLuckWins >= 666) Game.Win('Deal with the Devil');
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
								
							case 'surrender':
								winnings *= .5;
								messg = 'You lose half your bet';
								break;
								
							case 'push':
								if(Game.Has('Tiebreaker')){
									winnings *= 2;
									messg = 'Tie goes to player!';
									if (!Game.Has('Standard push')) {
										Game.Unlock('Standard push');
										Game.Upgrades['Standard push'].earn();
									}
								}else if(Game.Has('Standard push')){
									messg = 'True push - nobody wins!';
									this.tiesLost++;
									if(this.tiesLost >= 7) Game.Unlock('Tiebreaker');
								}else{
									winnings *= 0;
									messg = 'Tie goes to dealer';
									this.tiesLost++;
									if(this.tiesLost >= 3) Game.Unlock('Standard push');
								}
								
								break;
								
							default:
								break;
						}
						
						if (M.games.Blackjack.splits)
							M.games.Blackjack.splits--;
						messg += '<div style="font-size:65%;">';
						Game.Earn(winnings);
						if(winnings >= M.betAmount){
							this.wins++;
							this.winsT++;
							messg += 'Gain ' + Beautify(Math.abs(winnings - M.betAmount)) + ' cookies!';
							
							if(this.winsT >= 7 && Game.cookies * .02 >= Game.cookiesPsRawHighest * MINUTE)
								Game.Unlock('Raise the stakes');
							if(Game.Has('Raise the stakes') && this.winsT >= 49 && Game.cookies * .02 >= Game.cookiesPsRawHighest * HOUR)
								Game.Unlock('High roller!');
							if(Game.Has('High roller!') && this.winsT >= 77 && Game.cookies * .02 >= Game.cookiesPsRawHighest * DAY)
								Game.Unlock('Big spender!');
							if(Game.Has('Big spender!') && this.winsT >= 108 && Game.cookies * .02 >= Game.cookiesPsRawHighest * MONTH)
								Game.Unlock('Main player');
							if(Game.Has('Main player') && this.winsT >= 150 && Game.cookies * .02 >= Game.cookiesPsRawHighest * DECADE)
								Game.Unlock('True gambler');
							if(Game.Has('True gambler') && this.winsT >= 200 && Game.cookies * .02 >= Game.cookiesPsRawHighest * MILLENNIUM)
								Game.Unlock('Immortal bettor');
							
							if(this.winsT >= 21) Game.Win('Card minnow');
							if(this.winsT >= 210) Game.Win('Card trout');
							if(this.winsT >= 2100) Game.Win('Card shark');
							
							if(M.hands.player[M.currentPlayerHand].cards.length >= 5) Game.Win('Five card stud');
							if(M.hands.player[M.currentPlayerHand].cards.length >= 6) Game.Win("Why can't I hold all these cards?");
							if(M.hands.player[M.currentPlayerHand].value <= 5) Game.Win('I also like to live dangerously');
						}else{
							this.losses++;
							messg += 'Lost ' + Beautify(Math.abs(M.betAmount) - winnings) + ' cookies';
							if (this.losses >= 21) Game.Unlock('Surrender');
						}
						messg += '</div>';
						
						this.netTotal += winnings - M.betAmount;
						Game.Popup(messg, Game.mouseX, Game.mouseY);
						
						this.buildTable();
						this.buildSidebar();
					}
				}
			},
			
			draw : function(){
				//run each draw frame
				l('casinoCurrentBet').innerHTML = '(' + Beautify(M.betAmount) + ' cookies)';
			}
		
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
		'.casinoActionsTable tr{height: 40px;}' + 
		'#casinoGame{position: relative;}' + 
		'#casinoInfo{position: relative;text-align:center; font-size:11px; margin-top:12px; color:rgba(255,255,255,0.75); text-shadow:-1px 1px 0px #000;}' + 
		'</style>';
		str += '<div id="casinoBG"></div>';
		str += '<div id="casinoContent">';
			str += '<div id="casinoSidebar" class="framed">';
				str+='<div class="title casinoSidebarLabel"><span style="font-size: +1rem">Bet Amount</span></div><div class="line"></div>';
				str += '<div id="casinoMoney"></div>';
				str+='<div class="title casinoSidebarLabel"><br><span style="font-size: +1rem">Actions</font></div><div class="line"></div>';
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
		
		M.loadedCount++;
		if (Game.prefs.popups) Game.Popup('Casino loaded!');
		else Game.Notify('Casino loaded!', '', '', 1, 1);
	}
	
	M.save = function(){
		//output cannot use ",", ";" or "|"
		
		var getMinigameStateSave = function(){
			var res = '';
			res += parseInt(M.parent.onMinigame ? '1' : '0');
			res += '_' + parseInt(M.games.Blackjack.wins);
			res += '_' + parseInt(M.games.Blackjack.winsT);
			res += '_' + parseInt(M.games.Blackjack.ownLuckWins);
			res += '_' + parseInt(M.games.Blackjack.tiesLost);
			res += '_' + parseInt(M.betMode);
			res += '_' + parseInt(M.betChoice);
			res += '_' + parseFloat(M.games.Blackjack.netTotal);
			res += '_' + parseInt(0);
			res += '_' + parseInt(M.beatLength);
			res += '_' + Number(M.bankPercentage);
			
			return res;
		}
		
		var getGameStateSave = function(){
			var res = '';
			res += parseInt(M.currentPlayerHand);
			res += '_' + parseInt(M.nextBeat);
			res += '_' + parseInt(M.games.Blackjack.phase);
			res += '_' + parseInt(M.games.Blackjack.istep);
			res += '_' + parseFloat(M.betAmount);
			res += '_' + parseInt(M.games.Blackjack.hiddenCard.pip + 13 * M.games.Blackjack.hiddenCard.suit);
			
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
		
		CCSE.config.OtherMods[M.name] = str;
		M.saveString = str;
		return ''; //str;
	}
	
	M.load = function(str){
		//interpret str; called after .init
		//note : not actually called in the Game's load; see "minigameSave" in main.js
		if(!str) return false;
		M.saveString = str;
		
		var parseMinigameStateSave = function(str){
			var i = 0;
			var spl = str.split('_');
			var on = parseInt(spl[i++] || 0);
			M.games.Blackjack.wins = parseInt(spl[i++] || 0);
			M.games.Blackjack.winsT = parseInt(spl[i++] || 0);
			M.games.Blackjack.ownLuckWins = parseInt(spl[i++] || 0);
			M.games.Blackjack.tiesLost = parseInt(spl[i++] || 0);
			M.betMode = parseInt(spl[i++] || 0);
			M.betChoice = parseInt(spl[i++] || 0);
			M.games.Blackjack.netTotal = parseFloat(spl[i++] || 0);
			var dummy = parseInt(spl[i++] || 0);
			M.beatLength = parseInt(spl[i++] || 750);
			M.bankPercentage = Number(spl[i++] || true);
			
			if(on && Game.ascensionMode != 1) M.parent.switchMinigame(1);
		}
		
		var parseGameStateSave = function(str){
			var i = 0;
			var spl = str.split('_');
			M.currentPlayerHand = parseInt(spl[i++] || 0);
			M.nextBeat = parseInt(spl[i++] || 0);
			M.games.Blackjack.phase = parseInt(spl[i++] || 0);
			M.games.Blackjack.istep = parseInt(spl[i++] || 0);
			M.betAmount = parseFloat(spl[i++] || 0);
			M.games.Blackjack.hiddenCard = M.cards[parseInt(spl[i++] || 0)];
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
					M.games.Blackjack.getHandValue(M.hands.player[i]);
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
		
		M.games.Blackjack.getHandValue(M.hands.dealer);
		if(M.Deck.length < (M.minDecks * 52)) M.reshuffle();
		if(M.games.Blackjack.phase == M.games.Blackjack.phases.inactive){
			M.hands = {dealer:{value:0, cards:[]}, player:[{value:0, splitFirstTurn:false, betMultiplier:1, cards:[]}]};
			M.currentPlayerHand = 0;
		}
		
		M.games.Blackjack.buildSidebar();
		M.games.Blackjack.buildTable();
	}
	
	M.reset = function(hard){
		M.deckCount = 4;
		M.Deck = [];
		M.hands = {dealer:{value:0, cards:[]}, player:[{value:0, splitFirstTurn:false, betMultiplier:1, cards:[]}]};
		M.games.Blackjack.hiddenCard = M.cards[0];
		M.currentPlayerHand = 0;
		M.minDecks = 2;
		M.betAmount = 0;
		M.betChoice = 1;
		M.betMode = 1;
		M.games.Blackjack.wins = 0;
		M.games.Blackjack.losses = 0;
		M.games.Blackjack.ownLuckWins = 0;
		M.games.Blackjack.tiesLost = 0;
		M.games.Blackjack.phase = 0;
		M.games.Blackjack.istep = 0;
		M.nextBeat = Date.now();
		M.bankPercentage = true;
		
		M.setPercentagePrecision(1);
		
		if(hard){
			M.saveString = '';
		}
		
		M.reshuffle();
		
		M.buildSidebar();
		M.buildTable();
		
		setTimeout(function(M){return function(){M.onResize();}}(M), 10);
	}
	
	M.logic = function(){
		//run each frame
		if(M.games.choice == 0) M.games.Blackjack.logic();
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
		if(M.games.choice == 0) M.games.Blackjack.draw();
		
		l('casinoCurrentBet').innerHTML = '(' + Beautify(M.betAmount) + ' cookies)';
	}
	
	M.init(l('rowSpecial' + M.parent.id));
}


M.launcher = function(){
	var M = Game.Objects['Chancemaker'].minigame;
	
	const MINUTE = 60;
	const HOUR = 60 * 60;
	const DAY = 60 * 60 * 24;
	const MONTH = 60 * 60 * 24 * 30;
	const DECADE = 60 * 60 * 24 * 365.26 * 10;
	const MILLENNIUM = 60 * 60 * 24 * 365.26 * 1000;
	
	// Stuff that needs to wait for CCSE but should only run once goes here
	M.parent.minigameUrl = 'https://klattmose.github.io/CookieClicker/dummyFile.js';
	M.parent.minigameName = 'Casino';
	
	M.name = M.parent.minigameName;
	M.savePrefix = 'minigameCasino';
	M.sourceFolder = 'https://klattmose.github.io/CookieClicker/' + (0 ? 'Beta/' : '');
	M.cardsImage = M.sourceFolder + 'img/phantasypantsCards.png';
	M.iconsImage = M.sourceFolder + 'img/customIcons.png';
	M.chancemakerChance = 0.0002;
	M.beatLength = 750;
	
	//***********************************
	//    Upgrades
	//***********************************
	M.Upgrades = [];
	
	M.Upgrades.push(CCSE.NewUpgrade('Raise the stakes', "Can bet a minute of CPS at a time.<q>Now we're getting somewhere!</q>", 10, [0, 3, M.iconsImage])); 
	M.Upgrades.push(CCSE.NewUpgrade('High roller!', "Can bet an hour of CPS at a time.<q>If you have to ask, you can't afford it.</q>", 60, [0, 3, M.iconsImage])); 
	M.Upgrades.push(CCSE.NewUpgrade('Big spender!', "Can bet a day of CPS at a time.<q>Now you're getting serious.</q>", 90, [0, 3, M.iconsImage]));
	M.Upgrades.push(CCSE.NewUpgrade('Main player', "Can bet a month of CPS at a time.<q>Don't even think about it.</q>", 120, [0, 3, M.iconsImage])); 
	M.Upgrades.push(CCSE.NewUpgrade('True gambler', "Can bet a decade of CPS at a time.<q>Putting your life savings on the line.</q>", 180, [0, 3, M.iconsImage]));
	M.Upgrades.push(CCSE.NewUpgrade('Immortal bettor', "Can bet a millennium of CPS at a time.<q>Be prepared to spend lifetimes at this.</q>", 240, [0, 3, M.iconsImage]));
	
	M.Upgrades.push(CCSE.NewUpgrade('Math lessons', "Show the value of your current blackjack hand.<q>C'mon, it's not that hard.</q>", 1, [0, 3, M.iconsImage])); 
	M.Upgrades.push(CCSE.NewUpgrade('Counting cards', "Keeps track of which cards have been played. 2-6 increase the count by 1. 10-K and Aces decrease the count by 1. Higher counts give better odds.<q>Technically not cheating, but casinos frown on this sort of thing.</q>", 21, [0, 3, M.iconsImage])); 
	M.Upgrades.push(CCSE.NewUpgrade('Standard push', "A true tie - nobody wins.<q>Well, it's better than losing to the dealer.</q>", 8, [0, 3, M.iconsImage])); 
	M.Upgrades.push(CCSE.NewUpgrade('Tiebreaker', "Ties push to the player.<q>Look at me. I'm the dealer now.</q>", 15, [0, 3, M.iconsImage])); 
	M.Upgrades.push(CCSE.NewUpgrade('Double down', "Doubling down after splits is permitted.<q>Time to make some real money!</q>", 18, [0, 3, M.iconsImage])); 
	M.Upgrades.push(CCSE.NewUpgrade('Surrender', "Surrendering allows half your bet to be returned to you.<q>It's better than losing everyting!</q>", 35, [0, 3, M.iconsImage])); 
	M.Upgrades.push(CCSE.NewUpgrade('Strong split aces', "Drawing cards after splitting aces is allowed.<q>Don't try this in a casino, though.</q>", 50, [0, 3, M.iconsImage])); 
	M.Upgrades.push(CCSE.NewUpgrade('I make my own luck', "Each Chancemaker gives a <b>0.0<span></span>2%</b> chance to instantly win the hand.<q>Wait, that's illegal.</q>", 60, [0, 3, M.iconsImage])); 
	M.Upgrades.push(CCSE.NewUpgrade('Infinite Improbability Drive', "Chancemaker chance to instantly win the hand is <b>doubled</b>.<q>You stole a protoype spaceship just to cheat at cards?</q>", 250, [0, 3, M.iconsImage]));
	
	M.Upgrades.push(CCSE.NewUpgrade('Double or nothing', "Multiply your bet by <b>2</b>.<q>The Martingale System sounds good on paper, but one losing streak long enough will bankrupt anyone.</q>", 120, [0, 3, M.iconsImage])); 
	M.Upgrades.push(CCSE.NewUpgrade('Stoned cows', "Multiply your bet by <b>5</b>.<q>The steaks have never been higher!</q>", 300, [0, 3, M.iconsImage])); 
	M.Upgrades.push(CCSE.NewUpgrade('Game for Pros', "Multiply your bet by <b>20</b>.<q>Much skill is required here.</q>", 600, [0, 3, M.iconsImage]));
	
	M.Upgrades.push(CCSE.NewHeavenlyUpgrade('Actually, do tell me the odds', "Display the probabilities of various outcomes of taking an action in the Casino.<q>2 + 2 is 4 minus 1 that's 3 quick maffs.</q>", 21000000, [0, 3, M.iconsImage], 38, -188, []));
		Game.last.showIf = function(){return Game.HasAchiev('Card shark');}
	
	for(var i = 0; i < M.Upgrades.length; i++){
		M.Upgrades[i].order = 1000000 + i / 100;
		if(M.Upgrades[i].pool != 'prestige') M.Upgrades[i].priceFunc = function(){return this.basePrice * Game.cookiesPsRawHighest * 60;};
	}
	Game.Upgrades['Double or nothing'].order = Game.Upgrades['High roller!'].order + 0.001;
	Game.Upgrades['Stoned cows'].order = Game.Upgrades['Double or nothing'].order + 0.001;
	Game.Upgrades['Game for Pros'].order = Game.Upgrades['Stoned cows'].order + 0.001;
	
	
	//***********************************
	//    Achievements
	//***********************************
	M.Achievements = [];
	M.Achievements.push(CCSE.NewAchievement('Card minnow', 'Win <b>21</b> hands of blackjack.', [0, 3, M.iconsImage]));
	M.Achievements.push(CCSE.NewAchievement('Card trout', 'Win <b>210</b> hands of blackjack.', [0, 3, M.iconsImage]));
	M.Achievements.push(CCSE.NewAchievement('Card shark', 'Win <b>2100</b> hands of blackjack.', [0, 3, M.iconsImage]));
	M.Achievements.push(CCSE.NewAchievement('Five card stud', "Win a hand of blackjack with <b>5</b> cards in your hand.<q>Wait, what game are you playing again?</q>", [0, 3, M.iconsImage]));
	M.Achievements.push(CCSE.NewAchievement("Why can't I hold all these cards?", 'Win a hand of blackjack with <b>6</b> cards in your hand.', [0, 3, M.iconsImage]));
		Game.last.pool = 'shadow';
	M.Achievements.push(CCSE.NewAchievement('Ace up your sleeve', "Win <b>13</b> hands of blackjack through chancemaker intervention in one ascension.<q>I'll tell you what the odds are.</q>", [0, 3, M.iconsImage]));
	M.Achievements.push(CCSE.NewAchievement('Paid off the dealer', "Win <b>" + (13 * 13) + "</b> hands of blackjack through chancemaker intervention in one ascension.<q>Takes money to make money.</q>", [0, 3, M.iconsImage]));
	M.Achievements.push(CCSE.NewAchievement('Deal with the Devil', "Win <b>666</b> hands of blackjack through chancemaker intervention in one ascension.<q>Just sign right here.</q>", [0, 3, M.iconsImage]));
		Game.last.pool = 'shadow';
	M.Achievements.push(CCSE.NewAchievement('Blackjack!', "Be dealt a hand totaling 21 naturally.", [0, 3, M.iconsImage]));
	M.Achievements.push(CCSE.NewAchievement('I like to live dangerously', "Hit on <b>17</b> or above without going over <b>21</b>.", [0, 3, M.iconsImage]));
	M.Achievements.push(CCSE.NewAchievement('I also like to live dangerously', "Win with a hand of <b>5</b> or less.<q>Yeah baby!</q>", [0, 3, M.iconsImage]));
		Game.last.pool = 'shadow';
	
	for(var i = 0; i < M.Achievements.length; i++) M.Achievements[i].order = 1000000 + i / 100;
	
	
	//***********************************
	//    CCSE arrays
	//***********************************
	Game.customOptionsMenu.push(function(){
		CCSE.MenuHelper;
		var str = '<div class="listing">'
		+ CCSE.MenuHelper.ToggleButton(M, 'bankPercentage', 'Casino_bankPercentageButton', 'Bank Percentage ON', 'Bank Percentage OFF', "Casino.Toggle")
			+ '<label>Calculate all bets as a percentage of the current bank.</label></div>';
		var callback = "Game.Objects['Chancemaker'].minigame.beatLength = Math.round(l('beatLengthSlider').value); l('beatLengthSliderRightText').innerHTML = Game.Objects['Chancemaker'].minigame.beatLength;";
		str += '<div class="listing">' +
			CCSE.MenuHelper.Slider('beatLengthSlider', 'Beat Length', '[$]', () => M.beatLength, callback, 0, 1000, 10) + 
			'This is the time in milliseconds between each card deal.</div>';
		
		CCSE.AppendCollapsibleOptionsMenu(M.name, str);
	});
	
	Game.customStatsMenu.push(function(){
		CCSE.AppendStatsVersionNumber(M.name, M.version);
		if(M.loadedCount){
			if(M.games.Blackjack.netTotal) CCSE.AppendStatsGeneral('<div class="listing"><b>Blackjack has earned you :</b> <div class="price plain">' + Game.tinyCookie() + Beautify(M.games.Blackjack.netTotal) + '</div></div>');
			if(M.games.Blackjack.ownLuckWins) CCSE.AppendStatsSpecial('<div class="listing"><b>Made your own luck :</b> ' + M.games.Blackjack.ownLuckWins + ' times</div>');
		}
	});
	
	M.Toggle = function(prefName, button, on, off, invert){
		if(M[prefName]){
			l(button).innerHTML = off;
			M.bankPercentage = false;
		}
		else{
			l(button).innerHTML = on;
			M.bankPercentage = true;
		}
		l(button).className = 'smallFancyButton prefButton option' + ((M[prefName] ^ invert) ? '' : ' off');
		M.save();
		//M.init(M.div);
		M.buildSidebar();
	}
	
	CCSE.customLoad.push(function(ret){
		if(M.load){
			if(localStorage.getItem(M.savePrefix) != null && !CCSE.config.OtherMods[M.name]) CCSE.config.OtherMods[M.name] = localStorage.getItem(M.savePrefix);
			if(CCSE.config.OtherMods[M.name]) M.parent.minigameSave = CCSE.config.OtherMods[M.name];
			M.saveString = M.parent.minigameSave;
			
			M.load(M.saveString);
		}
		return ret;
	});
	
	Game.registerHook('check', function(){
		if(M.loadedCount){
			if(M.games.Blackjack.winsT >= 7) Game.Unlock('Raise the stakes');
			if(Game.Has('Raise the stakes') && M.games.Blackjack.winsT >= 49) Game.Unlock('High roller!');
			if(Game.Has('High roller!') && Game.cookies >= (4 * Game.cookiesPs * HOUR)) Game.Unlock('Double or nothing');
			if(Game.Has('Double or nothing') && Game.cookies >= (10 * Game.cookiesPs * HOUR)) Game.Unlock('Stoned cows');
			if(Game.Has('Stoned cows') && Game.cookies >= (30 * Game.cookiesPs * HOUR)) Game.Unlock('Game for Pros');
			if(Game.Has('Game for Pros') && M.games.Blackjack.winsT >= 77) Game.Unlock('Big spender!');
			if(Game.Has('Big spender!') && M.games.Blackjack.winsT >= 108) Game.Unlock('Main player');
			if(Game.Has('Main player') && M.games.Blackjack.winsT >= 150) Game.Unlock('True gambler');
			if(Game.Has('True gambler') && M.games.Blackjack.winsT >= 200) Game.Unlock('Immortal bettor');
			
			if(Game.Has('I make my own luck') && M.games.Blackjack.ownLuckWins >= 52) Game.Unlock('Infinite Improbability Drive');
			if(M.games.Blackjack.tiesLost >= 3) Game.Unlock('Standard push');
			if(M.games.Blackjack.tiesLost >= 7) Game.Unlock('Tiebreaker');
			if(M.games.Blackjack.doubleDown >= 7) Game.Unlock('Double down');
			if(M.games.Blackjack.splitsT >= 5) Game.Unlock('Strong split aces');
			
			if(M.games.Blackjack.winsT >= 21) Game.Win('Card minnow');
			if(M.games.Blackjack.winsT >= 210) Game.Win('Card trout');
			if(M.games.Blackjack.winsT >= 2100) Game.Win('Card shark');
			if(M.games.Blackjack.ownLuckWins >= 13) Game.Win('Ace up your sleeve');
			if(M.games.Blackjack.ownLuckWins >= (13 * 13)) Game.Win('Paid off the dealer');
			if(M.games.Blackjack.ownLuckWins >= 666) Game.Win('Deal with the Devil');
			
			if(M.games.choice == 0) M.games.Blackjack.buildSidebar();
		}
	});
	
	
	if(typeof CM != 'undefined') CM.Sim.InitData(); // Cookie Monster compatibility
	
	
	Game.LoadMinigames();
}

if(CCSE && CCSE.isLoaded){
	M.launcher();
}
else{
	if(!CCSE) var CCSE = {};
	if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
	CCSE.postLoadHooks.push(M.launcher);
}

var M = 0;