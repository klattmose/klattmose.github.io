Game.LoadMinigameMod = function(objKey, miniName, miniSource){
	Game.Objects[objKey].minigameUrl = miniSource;
	Game.Objects[objKey].minigameName = miniName;
	Game.LoadMinigames();
}

Game.LoadMinigameMod('Chancemaker', 'Casino', '../minigameCasino/minigameCasino.js');