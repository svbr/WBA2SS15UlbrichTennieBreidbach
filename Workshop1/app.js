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

//Hinzufügen eines Users
//Benötigt: Username
//Ausgabe: Username, UserID
app.post('/user', function(req, res){
    
    var newUser = req.body;
    
    db.incr('id:user', function(err, rep){
        newUser.id = rep;
        db.set('user:'+ newUser.id, JSON.stringify(newUser),function(err, rep){
			res.send("Der User " + JSON.stringify(newUser.name) + " mit der ID " + JSON.stringify(newUser.id) + " wurde hinzugefügt!").end();
		});
    });

});

//Hinzufügen von einer Bar 
//Benötigt: (UserID)
//Ausgabe: Barname, BarID, UserID
app.post('/user/:id/bars',function(req, res){ 
    
    var newBar = req.body;
    
    db.get('user:'+ req.params.id, function(err, rep){
        if(rep){
            db.incr('id:bars', function(err, rep){
                newBar.id = rep;
                db.set('bars:'+newBar.id, JSON.stringify(newBar),function(err, rep){
			         res.send("Die Bar " + JSON.stringify(newBar.name) + " mit der ID " + newBar.id + " wurde von dem User mit der ID " + req.params.id + " hinzugefügt!").end();
                });
            });
        }
            else{
                res.status(404).res.status(404).type('text').send("Der User mit der ID " + req.params.id + " wurde nicht gefunden")
        }
    });
});

//Hinzfügen der Details der Bar
//Benötigt: Sitzplaetze, Adresse, Typ, Behindertengerecht, Gegebenheiten; (BarID)
//Ausgabe: BarID
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
});

//Hinzufügen der Öffnungszeiten einer Bar
//Benötigt: montagvon, montagbis, dienstagvon, dienstagbis, mittwochvon, mittwochbis, donnerstagvon, donnerstagbis, freitagvon, freitagbis,
//          samstagvon, samstagbis, sonntagvon, sonntagbis; (BarID)
//Ausgabe: Wochentage(von,bis)
app.post('/bars/:id/oeffnungszeiten', function(req,res){
    var zeiten = req.body;
    db.get('bars:'+req.params.id, function(err, rep){
        if(rep){
            db.set('bars:'+req.params.id+'/oeffnungszeiten', JSON.stringify(zeiten),function(err,rep){
                res.send("Die Öffnungszeiten sind: \n Montag: von " + zeiten.montagvon +" bis " + zeiten.montagbis + "\n Dienstag: von " +                             zeiten.dienstagvon + " bis "+zeiten.dienstagbis+"\n Mittwoch: von" +zeiten.mittwochvon+ " bis "+zeiten.mittwochbis+"\n Donnerstag:                     von" +zeiten.donnerstagvon+" bis "+zeiten.donnerstagbis+ "\n Freitag: von " +zeiten.freitagvon+" bis " +zeiten.freitagbis+ "\n                         Samstag: von " +zeiten.samstagvon+ " bis "+zeiten.samstagbis+"\n Sonntag: von "+zeiten.sonntagvon+" bis "+zeiten.sonntagbis+"").end();
            });
        }
        else{
            res.status(404).type('text').send("Die Öffnungszeiten sind nicht angegeben.");
        }
    });

});

//Hinzufügen einer Getränkekarte einer Bar
//Benötigt: (BarID)
//Ausgabe: BarID
app.post('/bars/:id/karte', function(req, res){
	var newKarte = req.body;
	db.get('bars:'+req.params.id, function(err, rep){
       if(rep){
		   db.set('bars:'+req.params.id+'/karte', JSON.stringify(newKarte),function(err, rep){
			res.send("Die Karte wurde der ID " + req.params.id + " hinzugefügt!").end();
		});
       }
       else{
           res.status(404).type('text').send("Die Bar mit der ID " + req.params.id + " wurde nicht gefunden");
       }
   });

});

/*app.put(...., function(){
    --> userrechte werden überprüft
    --> daten werden barbeitet... je nach dem was im JSON-Objekt dinn ist
    --> änderung werden gespeichert
});*/

//Ausgabe des Users
//Benötigt: (UserID)
//Ausgabe: UserID, Username
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

//Ausgabe der Bar
//Benötigt: (BarID)
//Ausgabe: BarID, Barname
app.get('/bars/:id', function(req, res){ 
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

//Ausgabe der Details einer Bar
//Benötigt: (BarID)
//Ausgabe: Sitzplaetze, Adresse, Typ, Behindertengerecht, Gegebenheiten
app.get('/bars/:id/details', function(req, res){
   db.get('bars:'+req.params.id+'/details', function(err, rep){
       if(rep){
           var temp = rep.type('json');
           res.send(JSON.parse(temp));
       }
       else{
           res.status(404).type('text').send("Die Bar mit der ID " + req.params.id + " wurde nicht gefunden");
       }
   });
});

//Ausgabe der Karte einer Bar
//Benötigt: (BarID)
//Ausgabe: ggf. Getränke
app.get('/bars/:id/karte', function(req, res){ //Rückgabe der Karte der Bar mittels id
   db.get('bars:'+req.params.id+'/karte', function(err, rep){
       if(rep){
           var temp = JSON.parse(rep);
           res.send(temp);
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