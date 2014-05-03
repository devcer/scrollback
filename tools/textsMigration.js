var config = require("../config.js");
var objectlevel = require("objectlevel");
var log = require("../lib/logger.js");
// var leveldb = new objectlevel(__dirname+"/"+config.leveldb.path);
var db = require('mysql').createConnection(config.mysql);
var accountConnection = require('mysql').createConnection(config.mysql);
var leveldb, types;
var startTimes = {};
var owners = {};
db.connect();

function closeConnection(){
	db.end();
}

function migrateTexts(cb) {
	var stream = db.query("select * from text_messages order by time desc");
	stream.on("result", function(text) {
		db.pause();
		// types.texts.put()
		text.type = "text";

		// console.log("+++++++++++");
		text.threads = [];
		if(text.labels) {
			l = fixLabels(text);
			// console.log("---l---",l);
			if(l.indexOf("hidden") >= 0) {
				text.labels = {
					hidden: 1
				};
				l.splice(l.indexOf("hidden"),1);
			}else{
				text.labels = {};
			}
			
			if(l.length) {
				l.forEach(function(i) {
					if(!startTimes[i]) startTimes[i] = text.time;

					text.threads.push({
						id: i,
						title: i,
						startTime: startTimes[i] || {}
					});
				});
			}
		}
		// console.log("---l---",text.threads);
		// console.log("+++++++++++");
		types.texts.put(text, function(err){
			if(err) console.log("Error inserting", text);
			else{
				// console.log("Inserting ", text);
				db.resume();
			}
		});
	});
	stream.on("error", function(err){
		log("Error:", err);
	});

	stream.on('end', function(){
		console.log("Mirgration Complete!");
	});
}

(function(){
	var path = process.cwd();
	if(path.split("/")[path.split("/").length-1] !="scrollback"){
		return console.log("execute from the root of scrollback");
	}
	leveldb = new objectlevel(process.cwd()+"/leveldb-storage/"+config.leveldb.path);
	types = require("../leveldb-storage/types/types.js")(leveldb);
	migrateTexts();
})();




function fixLabels(element) {
	var labelObj, i, l ;
	if(!element.labels){
		return [];
	}
	try{
		labelObj = JSON.parse(element.labels);
		l = [];
		for(i in labelObj){
			if(labelObj.hasOwnProperty(i) && labelObj[i]){
				l.push(i);
			}
		}
		console.log(element.labels);
	}catch(Exception){

		l = [element.labels];
	}
	// console.log(element.labels, l);
	return l;
}