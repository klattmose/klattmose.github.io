var typ = Game.lumpCurrentType;
var target = Game.lumps;
if(typ == 0) target += 1;
else if(typ == 1) target += 2;
else if(typ == 2) target += 7;
else if(typ == 3) target += 2;
else if(typ == 4) target += 3;

while(Game.lumps != target || Game.lumpCurrentType != 2){
	Game.LoadSave();
	Game.clickLump();
}