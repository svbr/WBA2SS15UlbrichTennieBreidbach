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

// Verbing zum Server hergestellt?
db.on('connect', function() { 
    console.log('connected');
});


// User wird hinzugefügt (Benötigt: Username) (Ausgabe: Username, UserID)
app.post('/user', function(req, res){
    
    var newUser = req.body;
    
    db.incr('id:user', function(err, rep){
        newUser.id = rep;
        db.set('user:'+ newUser.id, JSON.stringify(newUser),function(err, rep){
			res.send("Der User " + JSON.stringify(newUser.name) + " mit der ID " + JSON.stringify(newUser.id) + " wurde hinzugefügt!").end();
		});
    });

});

//Hinzufügen von einer Bar durch einen User. (Benötigt: Barname, UserID) - (Ausgabe: Barname, BarID)
app.post('/user/:id/bars',function(req, res){
    var newBar = req.body;
    db.get('user:'+ req.params.id, function(err, rep){
        if(rep){
            db.incr('id:bars', function(err, rep){
                newBar.id = rep;
                db.set('bars:'+newBar.id, JSON.stringify(newBar),function(err, rep){
			         res.send("Die Bar " + JSON.stringify(newBar.name) + " mit der ID " + newBar.id + " wurde von dem User mit der ID " +                        req.params.id + " hinzugefügt!").end();
                });
            });
        }
        else{
            res.status(404).res.status(404).type('text').send("Der User mit der ID " + req.params.id + " wurde nicht gefunden")
        }
    });
});

// Hinzufügen der Details der Bar
app.post('/bars/:id/details', function(req, res){ 
    var newAnzahl = req.body;
    db.get('bars:'+req.params.id, function(err, rep){
       if(rep){
           db.set('bars:'+req.params.id+'/details', JSON.stringify(newAnzahl),function(err, rep){
			 res.send("Die Details wurden der ID " + req.params.id + " hinzugefügt!").end();
		});
       }
       else{
           res.status(404).type('text').send("Die Bar mit der ID " + req.params.id + " wurde nicht gefunden");
       }
   });
})




/*app.put(...., function(){
    --> userrechte werden überprüft
    --> daten werden barbeitet... je nach dem was im JSON-Objekt dinn ist
    --> änderung werden gespeichert
});*/

app.get('/user/:id', function(err, res){
    db.get('user:'+req.params.id, function(err, rep){
       if(rep){
           res.type('json').send(rep);
       }
       else{
           res.status(404).type('text').send("Die Bar mit der ID " + req.params.id + " wurde nicht gefunden");
       }
   });
});


app.get('/bars/:id', function(req, res){ //Rückgabe der Bar mittels bar/id
   db.get('bars:'+req.params.id, function(err, rep){
       if(rep){
           res.type('json').send(rep);
       }
       else{
           res.status(404).type('text').send("Die Bar mit der ID " + req.params.id + " wurde nicht gefunden");
     }
   });
});

app.get('/bars/:id/aktuell', function(req, res){
    //db.get --> liefert json-Objekt, das die bardaten enthält (bar, sitzplätze, öffnungszeiten, karte, Event)
        //--> aktuelles Datum muss ermittelt werden
        //--> daten verwerten und auf aktuelles Datum angepasst werden
    //ausgebe durch res.send

});

app.get('/bars/:id/details', function(req, res){ //Rückgabe der Details der Bar mittels id
   db.get('bars:'+req.params.id+'/details', function(err, rep){
       if(rep){
           var temp = JSON.parse(rep);
           res.send(temp.Typ);
       }
       else{
           res.status(404).type('text').send("Die Bar mit der ID " + req.params.id + " wurde nicht gefunden");
       }
   });
});


//müssen noch an die Datenbank angepasst werden
/*app.put('/',function(req, res){
    if (!freieSitzplaetze == 0){
        freieSitzplaetze--;
        belegteSitzplaetze++;
    }
	res.send(belegteSitzplaetze + " Sitzplaetz belegt").end();
});

app.get('/', function(req, res){
    res.send("Von " + sitzplaetze + " Sitzplaetze sind \n" + freieSitzplaetze + " freie Sitzplaetze vorhanden").end();
});
*/
app.listen(3000);