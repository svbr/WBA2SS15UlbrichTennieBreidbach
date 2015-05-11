//filesystem module fuer Zugriff auf Dateien
var fs = require('fs')

var wk; // Variable für JSON Datei

console.log();
console.log();

//Dateien einlesen & in data speichern
fs.readFile(__dirname+"/wolkenkratzer.json", function(err, data){
	if(err) throw err;
    
    // Json in Javascript-Objekt umwandeln
	wk = JSON.parse(data);

    //Daten nochmals ausgeben
	for(var i = 0; i < wk.wolkenkratzer.length; i++){
		console.log('Name: '+wk.wolkenkratzer[i].name);
		console.log('Stadt: '+wk.wolkenkratzer[i].stadt);
		console.log('Hoehe: '+wk.wolkenkratzer[i].hoehe+'m');
		console.log('-------------------------------------')
	}
	
	console.log();

});