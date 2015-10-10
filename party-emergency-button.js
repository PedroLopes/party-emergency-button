//server 
var http 		= require('http');
var sys 		= require('sys')
var path 		= require('path');
var fs 			= require('fs');
var second 		= require('fs');
//shell tools
var exec 		= require('child_process').exec;
//for client side publishing
var faye       	= require('faye');

const DEBUG = true;
var playing = false;
var skip = false;

//music scripts (python)
var location_exec = "/Users/pedro/Dropbox/13.Curating/2.MusicCurating/2015_October10thHouseGig/";
location_exec = "cd " + location_exec + ";";
var mocp_toggle = "killall mplayer; mocp -P; mplayer /Users/pedro/Dropbox/13.Curating/2.MusicCurating/2015_October10thHouseGig/5.ComunalDjSet/emergency-song/emergency.mp3  > /dev/null 2>&1; mocp -U";

var bayeux = new faye.NodeAdapter({
  mount:    '/faye',
  timeout:  45
});

var minute = 60;
var milliseconds = 1000;

extensions = {
	".html" : "text/html",
	".css" : "text/css",
	".js" : "application/javascript",
	".png" : "image/png",
	".gif" : "image/gif",
	".jpg" : "image/jpeg"
};

function getFile(filePath,res,mimeType){
	fs.exists(filePath,function(exists){
		if(exists){
			fs.readFile(filePath,function(err,contents){
				if(!err){ //file ok, serve it.
					res.writeHead(200,{
						"Content-type" : mimeType,
						"Content-Length" : contents.length
					});
					res.end(contents);
					if (DEBUG) console.log("done serving file " + filePath);
				} else {
					if (DEBUG) console.dir(err);
				};
			});
		} else { //404
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.end("Dont hack the emergency button... hummm.");
		};
	});
};

function requestHandler(req, res) {
	 if (req.method == 'GET'){
		var fileName = path.basename(req.url) || 'index.html';
		var ext = path.extname(fileName);
		var localFolder = __dirname + '/public/';
		//var page404 = localFolder + '404.html';

		if(!extensions[ext]){ //404
			res.writeHead(404, {'Content-Type': 'text/html'});
			res.end("Stop hacking webpages and start hacking muscles.");
		};
		getFile((localFolder + fileName),res,extensions[ext]);
	} else if (req.method == 'GET' && movement_id == 7){
		if (DEBUG) console.log("REDIRECTTTTT 302 / temp");
		res.writeHead(302,
		  {Location: 'http://'+final_url+":5001/"}
		);
		res.end();
	}
}

var server = http.createServer(requestHandler);
server.listen(3000); 
bayeux.attach(server);

var client_count = 0;

bayeux.on('handshake', function(clientId) {
	client_count++;
    if (DEBUG) console.log('Client connected', clientId);
    if (DEBUG) console.log('Clients' + client_count);
});

bayeux.on('disconnect', function(clientId) {
	client_count--;
    if (DEBUG) console.log('Client disconnected', clientId);
    if (DEBUG) console.log('Clients' + client_count);
});


bayeux.on('subscribe', function(clientId,channel) {
	//if (DEBUG) console.log('[SUBSCRIBE FROM CLIENT] ' + clientId + ' -> ' + ' -> ');
	if (DEBUG) console.log('[SUBSCRIBE FROM CLIENT] ' + clientId + ' -> ' + channel + ' -> ');
	if (playing)  {
		bayeux.getClient().publish('/talkback', {text: "disable"});	      
	}
	else if (!playing) {
		bayeux.getClient().publish('/talkback', {text: "enable"});
	}
});

bayeux.on('publish', function(clientId, channel, data) {
	if (channel != "/emergency") return;
	if (DEBUG) console.log('[GOT FROM CLIENT] ' + clientId + ' -> ' + channel + ' -> ' + data);
	if (!playing) {
		exec(location_exec + mocp_toggle, console.log);
		playing = true;
		bayeux.getClient().publish('/talkback', {text: "disable"});
		setTimeout(function() { 
			playing = false; 
			bayeux.getClient().publish('/talkback', {text: "enable"});
		}, 245*1000);
	} else if (playing) {
		bayeux.getClient().publish('/talkback', {text: "disable"});
	}
});

if (DEBUG) console.log("Started EMERGENCY BUTTON server. Verbose is On.");

function isOneDigit(input) {
     return /^(0|[1-9])$/.test(input);
}

function puts(error, stdout, stderr) { sys.puts(stdout) }
