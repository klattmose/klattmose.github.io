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