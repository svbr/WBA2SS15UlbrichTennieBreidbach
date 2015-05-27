var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs')

var app = express();
var jsonParser = bodyParser.json();
var sitzplaetze = 25;
var freieSitzplaetze = 25;
var belegteSitzplaetze = 0;


var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
	app.use(express.static(__dirname + '/public'));
	
	app.use(function(err, req, res, next){
		console.error(err.stack);
		res.end(err.status + ' ' + err.massage);
	});
};
app.post('/', jsonParser,function(req, res){
    var bar = req.body;
    res.send("Gesamtanzahl der Sitzplätze der Bar " + JSON.stringify(bar.name) + ": " + JSON.stringify(bar.sitzplaetze) + " von dem " +  JSON.stringify(bar.loginname) + " geändert").end();
});

app.put('/', jsonParser,function(req, res){
    if (!freieSitzplaetze == 0){
        freieSitzplaetze--;
        belegteSitzplaetze++;
    }
	res.send(belegteSitzplaetze + " Sitzplaetz belegt").end();
});

app.get('/', function(req, res){
    res.send("Von " + sitzplaetze + " Sitzplaetze sind \n" + freieSitzplaetze + " freie Sitzplaetze vorhanden").end();
});

app.listen(1337);