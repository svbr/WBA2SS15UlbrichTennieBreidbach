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

app.post('/bars',function(req, res){
    
    var newBar = req.body;
    
    db.incr('id:bars', function(err, rep){
		newBar.id = rep;
		db.set('bars:'+newBar.id, JSON.stringify(newBar),function(err, rep){
			res.json(newBar);
		});
	});
});


app.put('/',function(req, res){
    if (!freieSitzplaetze == 0){
        freieSitzplaetze--;
        belegteSitzplaetze++;
    }
	res.send(belegteSitzplaetze + " Sitzplaetz belegt").end();
});
app.get('/bars/:id', function(req, res){
   db.get('bars:'+req.params.id, function(err, rep){
       if(rep){
           res.type('json').send(rep);
       }
       else{
           res.status(404).type('text').send("Die Bar mit der ID" + rep.params.id + " wurde nicht gefunden");
       }
   });
});
app.get('/', function(req, res){
    res.send("Von " + sitzplaetze + " Sitzplaetze sind \n" + freieSitzplaetze + " freie Sitzplaetze vorhanden").end();
});

app.listen(3000);