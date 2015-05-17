var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs')

var app = express();
var jsonParser = bodyParser.json();
var sitzplaetze = 25;

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
	req.send(sitzplaetze);
});

app.get('/', function(req, res){
	res.send("Es sind "+ sitzplaetze + " Sitzplätze frei.");
	res.end();
});

app.listen(3000);