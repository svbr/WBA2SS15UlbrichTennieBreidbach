var express = require('express');
var bodyParser = require('body-parser');
var redis = require('redis');

var db = redis.createClient(); //creates a new client, standartport 6379
// Falls anderer Port:
// var client = redis.createClient(port, host);

var app = express();

app.use(bodyParser.json());

db.on('connect', function() { // Verbing zum Server hergestellt?
    console.log('connected');
});

app.post('/users', function(req, res){
	
	var newUser = req.body;
	
	db.incr('id:users', function(err, rep){
		newUser.id = rep;
		db.set('user:'+newUser.id, JSON.stringify(newUser),function(err, rep){
			res.json(newUser);
		});
	});
});

app.get('/users/:id', function(req, res){
		db.get('user:'+req.params.id, function(err, rep){
			if (rep){
				res.type('json').send(rep);
			}
			else{
				res.status(404).type('text').send('Der user mit der ID '+req.params.id+' wurde nicht gefunden');
			}
		});
});

app.listen(3000);