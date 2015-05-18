var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs')

var app = express();
var jsonParser = bodyParser.json();
var sitzplaetze = 25;
var freieSitzplaetze = 25;
var belegteSitzplaetze = 0;
//app.configure(function(){
	
var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
	app.use(express.static(__dirname + '/public'));
	
	app.use(function(err, req, res, next){
		console.error(err.stack);
		res.end(err.status + ' ' + err.massage);
	});
};

app.post('/', jsonParser,function(req, res){
    if (!freieSitzplaetze == 0){
        freieSitzplaetze--;
        belegteSitzplaetze++;
    }
	res.send(belegteSitzplaetze + " Sitzplaetz belegt").end();
});

app.get('/', function(req, res){
    res.send("Von " + sitzplaetze + " Sitzplaetze sind \n" + freieSitzplaetze + " freie Sitzplaetze vorhanden");
	res.end();
});

app.listen(1337);