if(FictionLiveParser === undefined) var FictionLiveParser = {};

FictionLiveParser.init = function(){
	if(FictionLiveParser.Users === undefined) FictionLiveParser.Users = {};
	if(FictionLiveParser.Database === undefined){
		var request = window.indexedDB.open("FictionLiveParser", 1);
		request.onerror = function(event){
			console.log(event);
			FictionLiveParser.unveilChatmessages(document);
			FictionLiveParser.pollEspionage();
		}
		request.onsuccess = function(event){
			FictionLiveParser.Database = request.result;
			FictionLiveParser.readDBIntoLocalVariable();
		}
		request.onupgradeneeded = function(event){
			var db = event.target.result;
			var objectStore = db.createObjectStore("Users", {keyPath: "_id"});
		}
	}
	if(FictionLiveParser.activeCalls === undefined) FictionLiveParser.activeCalls = 0;
	if(FictionLiveParser.searched === undefined) FictionLiveParser.searched = {};
	
	var showHideBtn = document.createElement("li");
	showHideBtn.innerHTML = '<a onclick="FictionLiveParser.toggleShowVotes()"><div id="FictionLiveParser_showHideBtn" class="btn"><span>Voters hidden</span></div></a>';
	$("li.storyMenu.dropdown-main").parent().append(showHideBtn);
	
	var processStoryBtn = document.createElement("li");
	processStoryBtn.id = 'FictionLiveParser_processStoryBtn';
	processStoryBtn.innerHTML = '<a onclick="FictionLiveParser.parseThisStory()"><div class="btn"><span>Process story</span></div></a>';
	$("li.storyMenu.dropdown-main").parent().append(processStoryBtn);
	
}

FictionLiveParser.put = function(_id, name) {
	FictionLiveParser.Users[_id] = name;
	FictionLiveParser.Database.transaction(["Users"], "readwrite").objectStore("Users").put({_id:_id, name:name}).onerror = function(event){console.log(event)};
}

FictionLiveParser.readDBIntoLocalVariable = function(){
	FictionLiveParser.Users = {};
	
	var request = FictionLiveParser.Database.transaction(["Users"]).objectStore("Users").getAll();
	
	request.onsuccess = function(event){
		if(event.srcElement.result){
			var res = event.srcElement.result;
			for(var i = 0; i < res.length; i++){
				FictionLiveParser.Users[res[i]._id] = res[i].name;
			}
		}
		
		FictionLiveParser.unveilChatmessages(document);
		FictionLiveParser.pollEspionage();
	}
	
	request.onerror = function(event){
		console.log(event);
		FictionLiveParser.unveilChatmessages(document);
		FictionLiveParser.pollEspionage();
	}
}

FictionLiveParser.seekUserName = function(userID, divs){
	FictionLiveParser.activeCalls++;
	$.get("https://fiction.live/api/anonkun/newsFeed/" + userID, FictionLiveParser.findUserActivity(divs));
	FictionLiveParser.activeCalls++;
	$.get("https://fiction.live/api/anonkun/userCollections/" + userID, FictionLiveParser.findUserActivity(divs));
	FictionLiveParser.activeCalls++;
	$.get("https://fiction.live/api/anonkun/userStories/" + userID, FictionLiveParser.findUserActivity(divs));
}

FictionLiveParser.parseChatSegment = function(data, status){
	if(data.length > 0){
		for(var i = 0; i < data.length; i++){
			var user = data[i].u[0]
			if(user !== undefined && user._id !== undefined){
				var userID = user._id;
				var userName = user.n;
				
				if(FictionLiveParser.Users[userID] === undefined){
					FictionLiveParser.put(userID, userName);
					
					if(userName == "Anon"){
						FictionLiveParser.seekUserName(userID);
						/*FictionLiveParser.activeCalls++;
						$.get("https://fiction.live/api/anonkun/newsFeed/" + userID, FictionLiveParser.findUserActivity());
						FictionLiveParser.activeCalls++;
						$.get("https://fiction.live/api/anonkun/userCollections/" + userID, FictionLiveParser.findUserActivity());
						FictionLiveParser.activeCalls++;
						$.get("https://fiction.live/api/anonkun/userStories/" + userID, FictionLiveParser.findUserActivity());*/
					}
				}
				else if(FictionLiveParser.Users[userID] == "Anon" && userName != "Anon"){
					FictionLiveParser.put(userID, userName);
				}
			}
		}
	}
}

FictionLiveParser.receiveStoryChapters = function(data, status){
	if(data.length > 0){
		for(var i = 0; i < data.length; i++){
			var requestbody = {r : data[i]._id};
			$.post("https://fiction.live/api/chat/light/page", requestbody, FictionLiveParser.parseChatSegment);
			
			if(data[i].userVotes){
				for(var j in data[i].userVotes){
					if(FictionLiveParser.Users[j] === undefined){
						FictionLiveParser.put(j, "Anon");
						FictionLiveParser.seekUserName(j);
					}
				}
			}
		}
	}
}

FictionLiveParser.findUserActivity = function(divs){
	return function(data, status){
		FictionLiveParser.activeCalls--;
		if(data.length > 0){
			for(var i = 0; i < data.length; i++){
				var userID = data[i].u[0]._id;
				var userName = data[i].u[0].n;
				if(userName != "Anon"){
					FictionLiveParser.put(userID, userName);
					if(divs !== undefined) FictionLiveParser.renameDivs(divs, userID, userName);
				}
			}
		}
		if(FictionLiveParser.activeCalls == 0){
			console.log("Done searching");
			FictionLiveParser.unveilChatmessages(document);
		}
	}
} 

FictionLiveParser.renameDivs = function(divs, userID, userName){
	for(var j = 0; j < divs.length; j++){
		var div = divs[j];
		div.childNodes[0].childNodes[0].innerHTML = "(" + (userName == "Anon" ? userID : '<a href="/user/' + userName + '">' + userName + '</a>') + ")";
	}
}

FictionLiveParser.handleChatMessage = function(data, status){
	if(data.length != 0){
		var u = data.u
		if(u != "Anon"){
			var userID = u[0]._id;
			var userName = u[0].n;
			var divs = $(".chatMsg[data-id='" + data._id + "']");
			
			if(FictionLiveParser.Users[userID] === undefined){
				FictionLiveParser.put(userID, userName);
				
				if(userName == "Anon"){
					FictionLiveParser.seekUserName(userID, divs);
					
					/*FictionLiveParser.activeCalls++;
					$.get("https://fiction.live/api/anonkun/newsFeed/" + userID, FictionLiveParser.findUserActivity(divs));
					FictionLiveParser.activeCalls++;
					$.get("https://fiction.live/api/anonkun/userCollections/" + userID, FictionLiveParser.findUserActivity(divs));
					FictionLiveParser.activeCalls++;
					$.get("https://fiction.live/api/anonkun/userStories/" + userID, FictionLiveParser.findUserActivity(divs));*/
				}
			}
			else if(userName == "Anon"){
				FictionLiveParser.renameDivs(divs, userID, FictionLiveParser.Users[userID]);
			}
		}
	}
}

FictionLiveParser.unveilChatmessages = function(root){
	var chatPosts = root.getElementsByClassName("chatMsg");
	for(var i = 0; i < chatPosts.length; i++){
		$.get("https://fiction.live/api/node/" + chatPosts[i].attributes["data-id"].value, FictionLiveParser.handleChatMessage);
	}
}

FictionLiveParser.ChatObserver = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		for(var i = 0; i < mutation.addedNodes.length; i++){
			var div = mutation.addedNodes[i];
			if(div.nodeType == 1){
				if(div.className == "poll") FictionLiveParser.pollEspionage();
				FictionLiveParser.unveilChatmessages(div);
			}
		}
	});
});

FictionLiveParser.ChatObserver.observe(document.documentElement, {
	attributes: false,
	characterData: false,
	childList: true,
	subtree: true,
	attributeOldValue: false,
	characterDataOldValue: false
});

FictionLiveParser.parseThisStory = function(){
	document.getElementById("FictionLiveParser_processStoryBtn").remove();
	$.get("https://fiction.live/api/anonkun/chapters/" + angular.element(document.getElementById("storyPosts")).scope().story._id + "/0/9999999999998", FictionLiveParser.receiveStoryChapters);
}

FictionLiveParser.pollEspionage = function(){
	var className = "FictionLiveParser_PollEspionage";
	$('.' + className).remove();
	
	if(FictionLiveParser.ShowVoters){
		var chapters = angular.element(document.getElementById("storyPosts")).scope().chapters;
		for(var i = 0; i < chapters.length; i++){
			var chapter = chapters[i];
			if(chapter.choices && chapter.votes && chapter.uidUser){
				var pollElement = $("article[data-id='" + chapter._id + "']");
				var choices = [];
				
				for(var j = 0; j < chapter.choices.length; j++){
					choices.push({text:chapter.choices[j], voters:[], votersSorted:[]});
				}
				
				for(var voter in chapter.votes){
					var user;
					
					if(chapter.uidUser[voter] === undefined){
						user = "anon";
					} else if(FictionLiveParser.Users[chapter.uidUser[voter]] === undefined){
						FictionLiveParser.put(chapter.uidUser[voter], "Anon");
						FictionLiveParser.seekUserName(chapter.uidUser[voter]);
						user = chapter.uidUser[voter];
					} else {
						user = (FictionLiveParser.Users[chapter.uidUser[voter]] == "Anon") ? chapter.uidUser[voter] : FictionLiveParser.Users[chapter.uidUser[voter]];
					}
					
					if(chapter.multiple){
						for(var k = 0; k < chapter.votes[voter].length; k++){
							choices[chapter.votes[voter][k]].voters.push(user);
						}
					} else {
						choices[chapter.votes[voter]].voters.push(user);
					}
				}
				
				for(var j = 0; j < choices.length; j++){
					var choice = choices[j];
					var anonCount = 0;
					for(var k = 0; k < choices[j].voters.length; k++){
						if(choice.voters[k] == "anon") anonCount++;
						else choice.votersSorted.push(choice.voters[k]);
					}
					choice.votersSorted.sort();
					for(var k = 0; k < anonCount; k++) choice.votersSorted.push("anon");
					
					var choiceElement = pollElement.find(".choiceItem[data-index='" + j + "']").find("tbody")[0];
					if(choiceElement){
						for(var k = 0; k < choice.votersSorted.length; k++){
							var tr = document.createElement("tr");
							tr.className = className;
							tr.innerHTML = '<td class="text"><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<small>' + choice.votersSorted[k] + '</small></span></td>';
							choiceElement.append(tr);
						}
					}
				}
			}
		}
	}
}

FictionLiveParser.toggleShowVotes = function(){
	FictionLiveParser.ShowVoters = !FictionLiveParser.ShowVoters;
	FictionLiveParser.pollEspionage();
	
	var showHideBtn = document.getElementById("FictionLiveParser_showHideBtn");
	if(FictionLiveParser.ShowVoters){
		showHideBtn.classList.add("active");
		showHideBtn.innerHTML = '<span>Voters shown</span>';
	} else {
		showHideBtn.classList.remove("active");
		showHideBtn.innerHTML = '<span>Voters hidden</span>';
	}
}


FictionLiveParser.init();