var home;
var DownPage;
var back;
var play;
var pause;
var stop;
var skipf;
var skipb;
var downlow;
var fileTransfer;
var uri;
var poder;
var podPage;
var podList;
var PodListings;
var targeter;
var dirEntry;
var media;
var networkState;
var PodcastPropList;
var info;
var director;
var counting;
var itemArray;
var parsing;
var imageCounter;

var init = {
    initialize: function() {
        PodcastPropList = {};
        this.bindEvents();
    },

    bindEvents: function() {
        home = document.getElementById("home");
        DownPage = document.getElementById("downloadPage");     
        play = document.getElementById("play");
        pause = document.getElementById("pause");
        stop = document.getElementById("stop");
        skipf = document.getElementById("fskip");
        skipb = document.getElementById("bskip");
        downlow = document.getElementById("download");
        poder = document.getElementById("downPod")
        podPage = document.getElementById("podPage");
        cancel = document.getElementById("cancel");
        podList = document.getElementById("podList");

        back = document.querySelectorAll("#back");
        podListings = document.querySelectorAll("#podList li a");

        if(detectTouchSupport()) {
            play.addEventListener('touchend',Podcast.Play, false);
            pause.addEventListener('touchend',Podcast.Pause, false);
            stop.addEventListener('touchend',Podcast.Stop, false);
            skipf.addEventListener('touchend',Podcast.skipForward, false);
            skipb.addEventListener('touchend',Podcast.skipBackward, false);
            downlow.addEventListener('touchend',navigation.PageChanger, false);
            poder.addEventListener('touchend',Podcast.Download, false);
        } else {
            play.addEventListener('click',Podcast.Play, false);
            pause.addEventListener('click',Podcast.Pause, false);
            stop.addEventListener('click',Podcast.Stop, false);
            skipf.addEventListener('click',Podcast.skipForward, false);
            skipb.addEventListener('click',Podcast.skipBackward, false);
            downlow.addEventListener('click',navigation.PageChanger,false);
            poder.addEventListener('click',Podcast.Download,false);
        }   

        for(var i = 0; i < podListings.length; i++) {
            if(detectTouchSupport()) {
                podListings[i].addEventListener('touchend',navigation.PageChanger, false);
            } else {
                podListings[i].addEventListener('click',navigation.PageChanger, false);
            }
        }

        for(var i = 0; i < back.length; i++) {
            if(detectTouchSupport()) {
                back[i].addEventListener('touchend',navigation.PageChanger, false);
            } else {
                back[i].addEventListener('click',navigation.PageChanger, false);
            }
        }
        document.addEventListener('deviceready', this.onDeviceReady, false);        
    },

    onDeviceReady: function() {
        var rays = [];
        PodcastPropList.Podcasts = rays;
        info = new Object();
        info.title = "Never gonna give you up";
        info.path = "Storage/sdcard/test.mp3";
        info.duration = "0:45";
        info.image = "img/No Icon.png";
        PodcastPropList.Podcasts[0] = info;
        counting = 0;
        if(networkState == "none") {
            sim.goOffline();
        } else {
            sim.goOnline();
        }
    },

    podStarter: function(connection) {
        if(connection == "offline") {
            alert("You are currently offline, if you wish to download more Podcasts, please go online");
        } else {
            console.log("Online");
        }
        for(var i = 0; i < PodcastPropList.Podcasts.length; i++) {
            var listing = document.createElement("li");
            var link = document.createElement("a");
            link.innerHTML = PodcastPropList.Podcasts[i].title;
            link.href="#home";
            link.id = PodcastPropList.Podcasts[i].path;
            podList.appendChild(listing);
            listing.appendChild(link);
            link.addEventListener("touchend",navigation.PageChanger,false);
        }
        fileTransfer = new FileTransfer();
        media = new Media(PodcastPropList.Podcasts[0].path, Podcast.Success, Podcast.Error, Podcast.Status);      
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(){
            console.log("Have access to local filesystem");
        }, function(){
            console.log("Don't have access to files");
        });

//        console.log(JSON.stringify(cordova.file));
        window.resolveLocalFileSystemURL("Storage/sdcard",function(dirEntry){
            director = dirEntry;
        }); 
    }
};

var Podcast = {
    Success: function() {
        console.log("created media object");
    },

    Error: function() {
        console.log("error with making media");
    },

    Status: function() {

    },

    Play: function(ev) {
        ev.preventDefault();

        media.play();
        mediaTimer = setInterval(function() {
            media.getCurrentPosition(
                function(position) {
                    // if(position > -1) {
                    //     setAudioP
                    // }
                }, 
                function(error) {
                    console.log("Cannot find position with "+error);
                }
            );
        }, 1000);
        alert("in play");
    },

    Pause: function(ev) {
        ev.preventDefault();
        media.pause();
    },

    Stop: function(ev) {
        ev.preventDefault();
        media.stop();
    },

    skipForward: function(ev) {
        ev.preventDefault();
        media.getCurrentPosition(
            function(position) {
                media.seekTo(position + (30 * 1000));
            },
            function(error) {
                console.log("cannot find current position, instead recieved: "+error);
            }
        );
    },

    skipBackward: function(ev) {
        ev.preventDefault();
        media.getCurrentPosition(
            function(position) {
                media.seekTo(position - (10 * 1000));
            },
            function(error) {
                console.log("cannot find current position, instead recieved: "+error);
            }
        );        
    },

    Download: function(ev) {
        ev.preventDefault();
        if(document.getElementById("downText").value == "") {
            alert("Enter a URL");
        } else {
            if(document.getElementById("downText").value.indexOf(".mp3") != -1) {
                uri = document.getElementById("downText").value;

                var item = new Object();
                item.title = document.getElementById("downText");
                item.path = "storage/sdcard/Podcast/"+document.getElementById("downText").value;
                item.duration = "unknown"
                item.image = null;
                PodcastPropList.Podcasts[podlength] = item;

                fileTransfer.download(uri, "storage/sdcard/Podcast/", Podcast.downloadSuccess, Podcast.downloadError);  
            } else {
                var request = new XMLHttpRequest();
                request.open("GET",document.getElementById("downText").value,true);
                request.onreadystatechange = function() {
                    if(request.readyState == 4) {
                        if(request.status == 200 || request.status == 0) {
                            
                            if(request.responseXML == null) {
                                console.log("The response is null, please try again")
                            } else {
                                parsing = request.responseXML;

                                itemArray = parsing.getElementsByTagName("item");

                                fileTransfer.onprogress = function(progress) {
                                    console.log("loading");
                                    if(progress.lengthComuptable) {
                                        console.log(progress.loaded);
                                        loadingStatus.setPercentage(progress.loaded / progress.total);
                                    } else {
                                        console.log("loading");
                                        loadingStatus.increment();
                                    }
                                };   

                                var podlength = PodcastPropList.Podcasts.length;         
                                var item = new Object();
                                item.title = itemArray[counting].querySelector("title").textContent;
                                item.path = "storage/sdcard/Podcast/"+itemArray[counting].querySelector("author").textContent+"/"+itemArray[counting].querySelector("title").textContent+".mp3";
                                item.duration = itemArray[counting].querySelector("duration").textContent;
                                item.image = itemArray[counting].querySelector("image").href;
                                PodcastPropList.Podcasts[podlength] = item;

                                uri = encodeURI(itemArray[counting].querySelector("link").textContent);
                                console.log(uri);

                                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(filesystem){
                                    console.log(filesystem.root.fullPath);
                                    console.log("Have access to local filesystem");
                                    filesystem.root.getDirectory("Podcast/"+itemArray[counting].querySelector("author").textContent+"/", {create: true, exclusive: false},Podcast.entrySuccess, Podcast.entryError);
                                // fileTransfer.download(uri, "file://storage/sdcard/Podcast/TAH/TAH.mp3", Podcast.downloadSuccess, Podcast.downloadError);                            
                                }, function(){console.log("Don't have access to files")});
                            }                    
                        }
                    }
                }
                request.send();                
            }            
        }
    },

    downloadSuccess: function(entry) {
        console.log("downloading at:  "+entry.fullpath);
        alert("download complete: "+entry.fullpath);
        if(counting < 2) {
            uri = encodeURI(itemArray[counting+1].querySelector("link").textContent);
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(filesystem){
                console.log("Have access to local filesystem");
                filesystem.root.getDirectory("Podcast/"+itemArray[counting].querySelector("author").textContent+"/", {create: true, exclusive: false},Podcast.entrySuccess, Podcast.entryError);
                // fileTransfer.download(uri, "file://storage/sdcard/Podcast/TAH/TAH.mp3", Podcast.downloadSuccess, Podcast.downloadError);                            
            }, function(){console.log("Don't have access to files")});
            counting++;
        }
    },

    downloadError: function(error) {
        console.log("error downloading file");
        alert("download error source: "+ error.source+" download error target: "+error.target+" upload error code: "+error.code+"  http status:"+error.http_status);
    },

    entrySuccess: function(parent) {
        alert("SUCCESSFULLY CREATED/FOUND FOLDER, "+parent.name);
        if(counting < 2) {
            fileTransfer.download(uri, "file:///storage/sdcard/Podcast/"+itemArray[counting].querySelector("author").textContent+"/"+itemArray[counting].querySelector("title").textContent+".mp3", Podcast.downloadSuccess, Podcast.downloadError);  
        }
    },

    entryError: function(error) {
        alert("ERROR IN CREATING FOLDER, "+error.code);
        console.log("ERROR IN CREATING FOLDER, "+error.code);
    }
};

var navigation = {
    PageChanger: function(ev) {
        ev.preventDefault();
        targeter = null;
        if(ev.currentTarget.href != "null" || ev.currentTarget.href != "undefined") {
            targeter = ev.currentTarget.href.split('#');
        } 
//        alert("in PageChanger");
        if(ev.currentTarget.id == "back") {
            podPage.className = "active";
            home.className = "inactive";
            downloadPage.className = "inactive";
        } else if(targeter[1] == "home") {
            console.log(ev.currentTarget.href);
            podPage.className = "inactive";
            home.className = "active";
            downloadPage.className = "inactive";
//            alert("IN HOME ");
            for(var i = 0; i < PodcastPropList.Podcasts.length; i++) {
//                alert("in for loop");
                console.log(PodcastPropList.Podcasts[i].path+" "+ev.currentTarget.id);
                if(PodcastPropList.Podcasts[i].path == ev.currentTarget.id) {
//                    alert("in readyforit");
                    media = new Media();
                    if(PodcastPropList.Podcasts[i].title == null || PodcastPropList.Podcasts[i].title == null || PodcastPropList.Podcasts[i].title == "") {
                        document.querySelector("#Podcast_Title").innerHTML = "Unknown";
                    } else {
                        document.querySelector("#Podcast_Title").innerHTML = PodcastPropList.Podcasts[i].title;
                    }
                    
                    if(PodcastPropList.Podcasts[i].image == null || PodcastPropList.Podcasts[i].image == null || PodcastPropList.Podcasts[i].image == "") 
                    {
                        document.querySelector("#Podcast_image").src = "img/No Icon.png";
                    } else {
                        document.querySelector("#Podcast_image").src = PodcastPropList.Podcasts[i].image;
                    }

                    if(PodcastPropList.Podcasts[i].duration == null || PodcastPropList.Podcasts[i].duration == null || PodcastPropList.Podcasts[i].duration == "") {
                        document.querySelector("#Podcast_length").innerHTML = "Duration: Unknown";
                    } else {
                        document.querySelector("#Podcast_length").innerHTML = "Duration: "+PodcastPropList.Podcasts[i].duration;
                    }
                    
                    media = new Media(PodcastPropList.Podcasts[i].path, Podcast.Success, Podcast.Error, Podcast.Status);
                    console.log(media);
                }
            }
            
        } else {
            podPage.className = "inactive";
            home.className = "inactive";
            downloadPage.className = "active";            
        }
    }
};

var reader = {
    success: function(entries) {
        for(var i = 0; i < entries.length; i++) {
            console.log(entries[i].name);
        }
    },

    Error: function(error) {
        alert("Failed to list directory contents: " +error.code);
    }
};

var sim = {
    goOffline: function() {
        sim._dispatchEvent("offline");
    },
    goOnline: function() {
        sim._dispatchEvent("online");
    }, 
    _dispatchEvent: function(eventType) {
        var event = document.createEvent('Event');
        event.initEvent(eventType, true, true);
        document.dispatchEvent(event);
        init.podStarter(eventType);
    }
};

init.initialize();

function detectTouchSupport(){
  msGesture = navigator && navigator.msPointerEnabled && navigator.msMaxTouchPoints > 0 && MSGesture;
  touchSupport = (("ontouchstart" in window) || msGesture || (window.DocumentTouch && document instanceof DocumentTouch));
  return touchSupport;
}