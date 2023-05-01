var RandomSynergies = {};

RandomSynergies.RerollSynergies = function(){
	// Seeded random: changes each ascension
	Math.seedrandom(Game.seed);
	var buildings = [];

	// Clear out synergy arrays for each building
	for(var i = 0; i < Game.ObjectsN; i++){
		var me = Game.ObjectsById[i];
		me.synergies = [];
		if(i >= 2) buildings.push(me);
	}

	// Loop through upgrades, randomize the synergy ones
	for(var i = 0; i < Game.UpgradesN; i++){
		var up = Game.UpgradesById[i];
		if(up.tier == 'synergy1' || up.tier == 'synergy2'){
			
			// Get the buildings
			var b1 = choose(buildings);
			var b2s = [];
			for(var j = 2; j < Game.ObjectsN; j++){
				if(b1.id != j){
					b2s.push(Game.ObjectsById[j]);
				}
			} 
			var b2 = choose(b2s);
			if (b1.basePrice>b2.basePrice) {var b3 = b2; b2 = b1; b1 = b3;}//swap
			
			// Quote goes bye bye, sorry
			up.baseDesc =
					loc("%1 gain <b>+%2%</b> CpS per %3.",[cap(b1.plural),5,b2.single])+'<br>'+
					loc("%1 gain <b>+%2%</b> CpS per %3.",[cap(b2.plural),0.1,b1.single]);
			
			up.buildingTie1 = b1;
			up.buildingTie2 = b2;
			
			b1.synergies.push(up);
			b2.synergies.push(up);
		}
	}

	LocalizeUpgradesAndAchievs();
}