var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs')
var redis = require('redis');

var db = redis.createClient();
var app = express();
var jsonParser = bodyParser.json();

app.use(bodyParser.json());


var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
	app.use(express.static(__dirname + '/public'));
	
	app.use(function(err, req, res, next){
		console.error(err.stack);
		res.end(err.status + ' ' + err.massage);
	});
};

db.on('connect', function() { // Verbing zum Server hergestellt?
    console.log('connected');
});

app.post('/bars',function(req, res){ //Hinzufügen von einer Bar
    
    var newBar = req.body;
    
    db.incr('id:bars', function(err, rep){
		newBar.id = rep;
		db.set('bars:'+newBar.id, JSON.stringify(newBar),function(err, rep){
			res.json(newBar);
		});
	});
});

app.post('/bars/:id/details', function(req, res){ //Hinzufügen der sitzplätze einer bestimmten Bar
    var newAnzahl = req.body;
    db.get('bars:'+req.params.id, function(err, rep){
       if(rep){
           db.set('/bars/:'+newAnzahl.id+'/details', JSON.stringify(newAnzahl),function(err, rep){
			 res.json(newAnzahl);
		});
       }
       else{
           res.status(404).type('text').send("Die Bar mit der ID " + req.params.id + " wurde nicht gefunden");
       }
   });
})

app.put('/',function(req, res){
    if (!freieSitzplaetze == 0){
        freieSitzplaetze--;
        belegteSitzplaetze++;
    }
	res.send(belegteSitzplaetze + " Sitzplaetz belegt").end();
});

app.get('/bars/:id', function(req, res){ //Rückgabe der bar mittels bar/id
   db.get('bars:'+req.params.id, function(err, rep){
       if(rep){
           res.type('json').send(rep);
       }
       else{
           res.status(404).type('text').send("Die Bar mit der ID " + req.params.id + " wurde nicht gefunden");
       }
   });
});

app.get('/bars/:id/details', function(req, res){ //Rückgabe der Details der Bar mittels id
   db.get('/bars/:'+req.params.id+'/details', function(err, rep){
       if(rep){
           res.type('json').send(rep);
       }
       else{
           res.status(404).type('text').send("Die Bar mit der ID " + req.params.id + " wurde nicht gefunden");
       }
   });
});

app.get('/', function(req, res){
    res.send("Von " + sitzplaetze + " Sitzplaetze sind \n" + freieSitzplaetze + " freie Sitzplaetze vorhanden").end();
});

app.listen(3000);