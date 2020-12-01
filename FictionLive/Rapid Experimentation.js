var j = _.find(angular.element(document.getElementById("storyPosts")).scope().chapters, function (t) {return t._id == "hSvHusdfvpzydYQT8";})

var getPoll = function(id){
	return _.find(angular.element(document.getElementById("storyPosts")).scope().chapters, function (t) {return t._id == id;})
}

$.get("https://fiction.live/api/anonkun/newsFeed/JEr6Lt8MFqYeqZbiE",function(data,status){console.log(data)})


var findUsername = function(userID){
	if(KnownUsers === undefined) var KnownUsers = {}
	if(KnownUsers[userID] === undefined){
		KnownUsers[userID] = userID; // Temporary value
	}
	else{
		return KnownUsers[userID];
	}
}

// https://fiction.live/api/chat/bx8sL7v8wesAg9wLs/latest

tqwqTndRXHsecxn5M
var requestbody = {r:"tqwqTndRXHsecxn5M"};
$.post("https://fiction.live/api/chat/light/page", requestbody, function(data,status){console.log(data)})






// "https://fiction.live/api/anonkun/chapters/bx8sL7v8wesAg9wLs/0/9999999999998"


$.get("https://fiction.live/api/node/7TSX26pLAKdux6G9",function(data,status){if(data.length != 0){console.log("Hello")}})


$("article[data-id='puYgcaCeqb3xqnZNg']").find("[data-index='0']").find(".result")


var x = {}
var getallll = function(){
	FictionLiveParser.Database.transaction(["Users"]).objectStore("Users").getAll().onsuccess = function(event){
		if(event.srcElement.result){
			var res = event.srcElement.result;
			for(var i = 0; i < res.length; i++){
				x[res[i]._id] = res[i].name;
			}
		}
	};
}

javascript:(function(){var script = document.createElement('script');script.setAttribute('src','https://klattmose.github.io/FictionLive/FictionLiveParser.js');document.head.appendChild(script);}())
javascript:(function(){FictionLiveParser.ShowVoters = !FictionLiveParser.ShowVoters;FictionLiveParser.pollEspionage();}())


var i = 0;
Game.wrinklers.forEach(function(item){
    if(item.phase == 2) i++;
});
if(i == Game.getWrinklersMax()) Game.CollectWrinklers();




var AntiSpam = {}
AntiSpam.postLimit = 5;
AntiSpam.lastPoster = {uid:'',inarow:-1};

AntiSpam.handleChatMessage = function(data, status){
	if(data.length != 0){
		var u = data.u
		if(u != "Anon"){
			var userID = u[0]._id;
			var userName = u[0].n;
			var divs = $(".chatMsg[data-id='" + data._id + "']");
			
			if(AntiSpam.lastPoster.uid == userID){
				AntiSpam.lastPoster.inarow++;
				if(AntiSpam.lastPoster.inarow > AntiSpam.postLimit) document.delete(divs);
			}else{
				AntiSpam.lastPoster.uid = userID;
				AntiSpam.lastPoster.inarow = 1;
			}
		}
	}
}

AntiSpam.getPostData = function(root){
	var chatPosts = root.getElementsByClassName("chatMsg");
	for(var i = 0; i < chatPosts.length; i++){
		chatPosts[i].style.display = "";
		$.get("https://fiction.live/api/node/" + chatPosts[i].attributes["data-id"].value, FictionLiveParser.handleChatMessage);
	}
}

AntiSpam.observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		for(var i = 0; i < mutation.addedNodes.length; i++){
			var div = mutation.addedNodes[i];
			if(div.nodeType == 1){
				FictionLiveParser.getPostData(div);
			}
		}
	});
});

AntiSpam.observer.observe(document.documentElement, {
	attributes: false,
	characterData: false,
	childList: true,
	subtree: true,
	attributeOldValue: false,
	characterDataOldValue: false
});