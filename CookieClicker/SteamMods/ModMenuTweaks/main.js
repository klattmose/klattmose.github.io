var MMT = {};

MMT.init = function(){
	CCSE.MenuHelper.AutoVersion(MMT);
	
	CCSE.AddStyles(`[draggable]{
					  -moz-user-select: none;
					  -khtml-user-select: none;
					  -webkit-user-select: none;
					  user-select: none;
					  /* Required to make elements draggable in old WebKit */
					  -khtml-user-drag: element;
					  -webkit-user-drag: element;
					}
					
					.mod-listing.dragElem {
					  opacity: 0.4;
					}
					
					.mod-listing.over{
						border-top: 2px solid blue;
					}`);
	
	Game.customModsPopupUpdateModList.push(function(selectedMod){
		for (let i=0; i<MMT.mods.length; i++){
			let mod = MMT.mods[i];
			let modDiv = l('mod-'+i);
			modDiv.classList.add('mod-listing');
			modDiv.draggable = true;
			
			AddEvent(modDiv, 'dblclick',  MMT.handleDblClick(mod));
			
			AddEvent(modDiv, 'dragstart', MMT.handleDragStart(i));
			AddEvent(modDiv, 'dragenter', MMT.handleDragEnter);
			AddEvent(modDiv, 'dragover',  MMT.handleDragOver);
			AddEvent(modDiv, 'dragleave', MMT.handleDragLeave);
			AddEvent(modDiv, 'drop',      MMT.handleDrop(i));
			AddEvent(modDiv, 'dragend',   MMT.handleDragEnd);
		}
	});
	
	Game.customModsPopup.push(function(){
		let updatePromptHeight = function(){
			
			// Get the game scale
			var w = window.innerWidth;
			var h = window.innerHeight;
			var scale = Math.min(
				w / Math.max(800, w), 
				h / Math.max(200, h),
			);
			
			// Get the height of the other elements of the prompt besides the modList
			let otherPromptHeight = l('prompt').scrollHeight - l('modList').parentNode.scrollHeight;
			otherPromptHeight *= scale;
			
			let modListHeight = MMT.mods.length * l('mod-1').scrollHeight;
			modListHeight = Math.min(modListHeight, (window.innerHeight - otherPromptHeight - 40) / scale);
			modListHeight = Math.max(modListHeight, 0);
			
			l('modList').parentNode.style.height = modListHeight + "px";
		}
		
		if(Game.promptUpdateFunc) updatePromptHeight();
		else Game.promptUpdateFunc = updatePromptHeight;
		
		Game.UpdatePrompt();
	});
	
	Game.customWorkshopPopupUpdatePublishedModsPopup.push(function(response){
		if(response && response.list){
			let updatePromptHeight = function(){
				
				if(l('modDisplay').childNodes[0]){
					// Get the game scale
					var w = window.innerWidth;
					var h = window.innerHeight;
					var scale = Math.min(
						w / Math.max(800, w), 
						h / Math.max(200, h),
					);
					
					// Get the height of the other elements of the prompt besides the modDisplay
					let otherPromptHeight = l('prompt').scrollHeight - l('modDisplay').parentNode.scrollHeight;
					otherPromptHeight *= scale;
					
					let modListHeight = response.list.length * l('modDisplay').childNodes[0].scrollHeight;
					modListHeight = Math.min(modListHeight, (window.innerHeight - otherPromptHeight - 200) / scale);
					modListHeight = Math.max(modListHeight, 0);
					
					l('modDisplay').style.height = modListHeight + "px";
				}
			}
			
			if(Game.promptUpdateFunc) updatePromptHeight();
			else Game.promptUpdateFunc = updatePromptHeight;
			
			Game.UpdatePrompt();
		}
		
	});
	
	// Too many locally defined functions to do this easily any other way
	CCSE.ReplaceCodeIntoFunction('Steam.modsPopup', "Game.Prompt", 
			`MMT.mods = mods;
			MMT.updateModList = updateModList;
			MMT.checkModDependencies = checkModDependencies;
			MMT.updateModOptions = updateModOptions;
			MMT.changeMods = changeMods;`, -1);
}


MMT.handleDblClick = function(mod){
	return function(){
		if (!MMT.checkModDependencies(mod)){
			MMT.updateModOptions();
			return false;
		}
		
		MMT.changeMods();
		mod.disabled = !mod.disabled;
		MMT.updateModList();
	}
}

MMT.handleDragStart = function(i){
	return function(e){
		// Target (this) element is the source node.
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData("text/plain", MMT.mods[i].name);
		this.classList.add('dragElem');
		MMT.draggingMod = i;
	}
}

MMT.handleDragEnter = function(e){
	// this / e.target is the current hover target.
}

MMT.handleDragOver = function(e){
	if(e.preventDefault){
		e.preventDefault(); // Necessary. Allows us to drop.
	}
	this.classList.add('over');
	e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
	return false;
}

MMT.handleDragLeave = function(e){
	this.classList.remove('over');  // this / e.target is previous target element.
}

MMT.handleDrop = function(i){
	return function(e){
		// this/e.target is current target element.
		if(e.stopPropagation){
			e.stopPropagation(); // Stops some browsers from redirecting.
		}
		
		if(i != MMT.draggingMod){
			var temp = MMT.mods[MMT.draggingMod];
			MMT.mods.splice(i, 0, temp);
			MMT.mods.splice(MMT.draggingMod + (i < MMT.draggingMod ? 1 : 0), 1);
			MMT.changeMods();
		}
		
		MMT.updateModList();
		return false;
	}
}

MMT.handleDragEnd = function(e){
	// this/e.target is the source node.
	this.classList.remove('over');
}


Game.registerMod("Mod Menu Tweaks", MMT);