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

app.post('/bars/:id/sitzplaetze', function(req, res){
    var newSp = req.body;
    db.get('bars:'+req.params.id, function(err, rep){
       if(rep){
           db.set('bars:'+req.params.id+'/sitzplaetze', JSON.stringify(newSp),function(err, rep){
			 res.send("Die Sitzplaetze wurden der ID " + req.params.id + " hinzugefügt!").end();
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
                res.send("Die Öffnungszeiten sind: \n Montag: von " + zeiten.montagvon +" bis " + zeiten.montagbis + "\n Dienstag: von " +                             zeiten.dienstagvon + " bis "+zeiten.dienstagbis+"\n Mittwoch: von" +zeiten.mittwochvon+ " bis "+zeiten.mittwochbis+"\n Donnerstag: von" +zeiten.donnerstagvon+" bis "+zeiten.donnerstagbis+ "\n Freitag: von " +zeiten.freitagvon+" bis " +zeiten.freitagbis+ "\n Samstag: von " +zeiten.samstagvon+ " bis "+zeiten.samstagbis+"\n Sonntag: von "+zeiten.sonntagvon+" bis "+zeiten.sonntagbis+"").end();
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

app.post('/bars/:id/events', function(req, res){
    var newEvent = req.body;
    db.rpush(['bars:'+req.params.id+'/events', JSON.stringify(newEvent)], function(err, rep){
        res.send("Das " + rep + ". Event "+ JSON.stringify(newEvent.event)+ " wurde hinzugefügt.");
    });
});

app.put('/bars/:id/sitzplaetze', function(req, res){
    db.exists('bars:'+req.params.id, function(err, rep){
        if(rep === 1){
            var newSp = req.body;
            db.get('bars:'+req.params.id+'/sitzplaetze', function(err, rep){
                if(rep){
                    var temp = JSON.parse(rep);
                    if(newSp.asp > temp.sitzplaetze){ //achtung!!! Groß und Kleinschreibung
                        res.send("Der neue asp wert ist zu hoch!");
                } else{
                    delete temp.asp;
                    temp.asp = newSp.asp;
                    db.set('bars:'+req.params.id+'/sitzplaetze', JSON.stringify(temp),function(err, rep){
			             res.send("aktuell").end();
		          });
                }
            }
            else{
                res.status(404).type('text').send("Die Bar mit der ID " + req.params.id + " wurde nicht gefunden");
            }
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
app.get('/user/:id', function(req, res){
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
    var currentdate = new Date();
	var tag = currentdate.getDate(); //aktueller tag, 0-6, 0 == sonntag
	var stunde = currentdate.getHours(); //aktuelle stunde
    
    var dd = currentdate.getDate();
    var mm = currentdate.getMonth()+1; //January is 0!
    var yyyy = currentdate.getFullYear();

    if(dd<10) { 
        dd='0'+dd
    } 

    if(mm<10) {
        mm='0'+mm
    } 

    var today = dd+'.'+mm+'.'+yyyy;
    
	db.get('bars:'+req.params.id+'/oeffnungszeiten', function(err, rep){
		
		if(rep){
			var zeiten = JSON.parse(rep);
			switch(tag){
			case 1:
					if(zeiten.montagvon <= stunde && zeiten.montagbis >= stunde){
						var zustand = "geoeffnet";
					}
					else{
						var zustand = "geschlossen";
					}
					break;
			case 2:
					if(zeiten.dienstagvon <= stunde && zeiten.dienstagbis >= stunde){
						var zustand = "geoeffnet";
					}
					else{
						var zustand = "geschlossen";
					}
					break;
			case 3:
					if(zeiten.mittwochvon <= stunde && zeiten.mittwochbis >= stunde){
						var zustand = "geoeffnet";
					}
					else{
						var zustand = "geschlossen";
					}
					break;
			case 4:
					if(zeiten.donnerstagvon <= stunde && zeiten.donnerstagbis >= stunde){
						var zustand = "geoeffnet";
					}
					else{
						var zustand = "geschlossen";
					}
					break;
			case 5:
					if(zeiten.freitagvon <= stunde && zeiten.freitagbis >= stunde){
						var zustand = "geoeffnet";
					}
					else{
						var zustand = "geschlossen";
					}
					break;
			case 6:
					if(zeiten.samstagvon <= stunde && zeiten.samstagbis >= stunde){
						var zustand = "geoeffnet";
					}
					else{
						var zustand = "geschlossen";
					}
					break;
			case 0:
					if(zeiten.sonntagvon <= stunde && zeiten.sonntagbis >= stunde){
						var zustand = "geoeffnet";
					}
					else{
						var zustand = "geschlossen";
					}
					break;
            }
            res.send(zustand + "!");
        }
	else{
		res.status(404).type('text').send("Die Bar mit der ID " + req.params.id + " wurde nicht gefunden");	
	}
    });
});





//Ausgabe der Details einer Bar
//Benötigt: (BarID)
//Ausgabe: Sitzplaetze, Adresse, Typ, Behindertengerecht, Gegebenheiten
app.get('/bars/:id/details', function(req, res){
    db.exists('bars:'+req.params.id, function(err, rep){
        if(rep === 1){
            db.get('bars:'+req.params.id+'/details', function(err, rep){
                if(rep){
                    var temp = rep;
                    res.send(JSON.parse(temp));
                }
                else{
                    res.status(404).type('text').send("Die Details der Bar mit der ID " + req.params.id + " wurde nicht gefunden");
                }
            });
        } 
        else{
            res.status(404).type('text').send("Die Bar mit der ID " + req.params.id + " wurde nicht gefunden");
        }
   });
});


app.get('/bars/:id/sitzplaetze', function(req, res){
    db.exists('bars:'+req.params.id, function(err, rep){
        if(rep === 1){
            db.get('bars:'+ req.params.id+'/sitzplaetze', function(err, rep){
                if(rep){
                    var temp = rep;
                    res.send(JSON.parse(temp));
                }
                else{
                    res.status(404).type('text').send("Die Sitzplätze der Bar mit der ID " + req.params.id + " wurde nicht gefunden");
                }
             });
        }
        else{
                res.status(404).type('text').send("Die Bar mit der ID " + req.params.id + " wurde nicht gefunden");
        }
    });
});



app.get('/bars/:id/oeffnungszeiten', function(req, res){
    db.exists('bars:'+req.params.id, function(err, rep){
        if(rep === 1){
            db.get('bars:'+ req.params.id+'/oeffnungszeiten', function(err, rep){
            if(rep){
                res.send(JSON.parse(rep));
            }
            else{
                res.status(404).type('text').send("Die Öffnungszeiten der Bar mit der ID " + req.params.id + " wurde nicht gefunden");
            }
            });
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
   db.exists('bars:' + req.params.id, function(err, rep){
       if(rep === 1){
            db.get('bars:'+req.params.id+'/karte', function(err, rep){
                if(rep){
                    var temp = JSON.parse(rep);
                    res.send(temp);
                }
                else{
                    res.status(404).type('text').send("Die Karte der Bar mit der ID " + req.params.id + " wurde nicht gefunden");
                }
            });
       }
       else {
            res.status(404).type('text').send("Die Bar mit der ID " + req.params.id + " wurde nicht gefunden");
       }
   });
});
    

app.get('/bars/:id/events', function(req, res){
        db.lrange('bars:'+req.params.id+'/events', 0, -1, function(err, rep) {
           res.send("Events: " + rep);
    });  
});


app.delete('/user/:id', function(req, res){
    db.exists('user:'+req.params.id, function(err, rep){
        if(rep === 1){
            db.del('user:'+req.params.id,function(err, rep){
                res.send("Der User mit der ID " + req.params.id + " wurde gelöscht!").end();
            });
        }
        else{
            res.status(404).send("Der User wurde nicht gefunden!").end();   
        }
    });
});

app.delete('/bars/:id', function(req, res){
    db.exists('bars:'+req.params.id, function(err, rep){
        if(rep === 1){
            db.del('bars:'+req.params.id,function(err, rep){
                res.send("Die Bar mit der ID " + req.params.id + " wurde gelöscht!").end();
            });
        }
        else{
            res.status(404).send("Die Bar wurde nicht gefunden!").end();   
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