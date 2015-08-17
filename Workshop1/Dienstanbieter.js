var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var redis = require('redis');
var async = require('async');

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
			res.type('json').send(newUser).end();
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
            db.incr('bid:bars', function(err, rep){
                newBar.bid = rep;
                newBar.userID = req.params.id;
                //json-array wird angelegt damit mit kein post für event benötigt wird
                var temp = {
                    barEvent: []
                };
                
                db.set('maxAnzahlBars', JSON.stringify(newBar), function(err, rep){
                });
                
                db.set('barsEvent:'+newBar.bid, JSON.stringify(temp), function(err, rep){
                });
                
                db.set('bars:'+newBar.bid, JSON.stringify(newBar),function(err, rep){
                    res.type('json').send(newBar).end();
                });
            });
        }
            else{
                res.status(404).type('text').send("Der User mit der ID " + req.params.id + " wurde nicht gefunden")
        }
    });
});

//Hinzfügen der Details der Bar
//Benötigt: Sitzplaetze, Adresse, Typ, Behindertengerecht, Gegebenheiten; (BarID)
//Ausgabe: BarID

app.post('/user/:id/bars/:bid/sitzplaetze', function(req, res){
    var newSp = req.body;
    db.get('bars:'+req.params.bid, function(err, rep){
       if(rep){
           rep=JSON.parse(rep);
           if(rep.userID == req.params.id){
              db.set('bars:'+req.params.bid+'/sitzplaetze', JSON.stringify(newSp),function(err, rep){
			     res.type('json').send(newSp).end();
		      });
           }
           else{
                res.status(404).type('text').send("Der User mit der ID " + req.params.id + " darf die Bar mit der ID " + req.params.bid + " nicht verändern");
           }
       }
       else{
           res.status(404).type('text').send("Die Bar mit der ID " + req.params.bid + " wurde nicht gefunden");
       }
   });
});

//Hinzufügen der Öffnungszeiten einer Bar
//Benötigt: montagvon, montagbis, dienstagvon, dienstagbis, mittwochvon, mittwochbis, donnerstagvon, donnerstagbis, freitagvon, freitagbis,
//          samstagvon, samstagbis, sonntagvon, sonntagbis; (BarID)
//Ausgabe: Wochentage(von,bis)
app.post('/user/:id/bars/:bid/oeffnungszeiten', function(req,res){
    var zeiten = req.body;
    db.get('bars:'+req.params.bid, function(err, rep){
        if(rep){
            rep=JSON.parse(rep);
            if(rep.userID == req.params.id){
                db.set('bars:'+req.params.bid+'/oeffnungszeiten', JSON.stringify(zeiten),function(err,rep){
                    res.type('json').send(zeiten).end();
                });
            }
            else{
                res.status(404).type('text').send("Der User mit der ID " + req.params.id + " darf die Bar mit der ID " + req.params.bid + " nicht verändern");
            }
        }
        else{
            res.status(404).type('text').send("Die Öffnungszeiten sind nicht angegeben.");
        }
    });

});

//Hinzufügen einer Getränkekarte einer Bar
//Benötigt: (BarID)
//Ausgabe: BarID
app.post('/user/:id/bars/:bid/getraenkekarte', function(req, res){
    
	var newKarte = req.body;
	db.get('bars:'+req.params.bid, function(err, rep){
       if(rep){
           rep=JSON.parse(rep);
            if(rep.userID == req.params.id){
		      db.set('bars:'+req.params.id+'/karte', JSON.stringify(newKarte),function(err, rep){
			     res.type('json').send(newKarte).end();
		      });
            }
            else{
                res.status(404).type('text').send("Der User mit der ID " + req.params.id + " darf die Bar mit der ID " + req.params.bid + " nicht verändern");
            }
       }
       else{
           res.status(404).type('text').send("Die Bar mit der ID " + req.params.bid + " wurde nicht gefunden");
       }
   });

});

app.put('/user/:id/bars/:bid/getraenkekarte', function(req, res){
    db.get('bars:'+ req.params.bid, function(err,rep){
        if(rep){
            var newKarte = req.body;
            var temp = JSON.parse(rep);
            db.set('bars:'+req.params.bid, JSON.stringify(newKarte), function(err, rep){
                res.type('json').send(newKarte).end();
            });
        }
        else{
            res.status(404).type('text').send("Die Bar mit der ID " + req.params.bid + " wurde nicht gefunden");
        }
    });
});

app.put('/user/:id', function(req, res){
    db.get('user:'+ req.params.id, function(err,rep){
        if(rep){
            var newUser = req.body;
            newUser.id = req.params.id;
            var temp = JSON.parse(rep);
            db.set('user:'+req.params.id, JSON.stringify(newUser), function(err, rep){
                res.type('json').send(newUser).end();
            });
        }
        else{
            res.status(404).type('text').send("Der User mit der ID " + req.params.id + " wurde nicht gefunden");
        }
    });
});

app.put('/user/:id/bars/:bid', function(req, res){
    db.get('bars:'+ req.params.bid, function(err,rep){
        if(rep){
            var newBar = req.body;
            newBar.bid = req.params.bid;
            var temp = JSON.parse(rep);
            db.set('bars:'+req.params.bid, JSON.stringify(newBar), function(err, rep){
                res.type('json').send(newBar).end();
            });
        }
        else{
            res.status(404).type('text').send("Die Bar mit der ID " + req.params.bid + " wurde nicht gefunden");
        }
    });
});

app.put('/user/:id/bars/:bid/oeffnungszeiten', function(req, res){
    db.get('bars:'+ req.params.bid, function(err,rep){
        if(rep){
            var newZeiten = req.body;
            var temp = JSON.parse(rep);
            db.set('bars:'+req.params.bid, JSON.stringify(newZeiten), function(err, rep){
                res.type('json').send(newZeiten).end();
            });
        }
        else{
            res.status(404).type('text').send("Die Bar mit der ID " + req.params.bid + " wurde nicht gefunden");
        }
    });
});

// newEvent = req.body;
// newEvent./bars/:id/events.length
// neue Events hinzufügen	
// daten zum array hinzufügen

app.put('/user/:id/bars/:bid/events', function(req, res){
    db.get('bars:'+ req.params.bid, function(err,rep){
        if(rep){
            rep=JSON.parse(rep);
                if(rep.userID == req.params.id){
	                 var newEvent = req.body;
	                 db.get('barsEvent:'+req.params.bid, function(err, rep){
		                  if(rep){
		                  oldEventlist = JSON.parse(rep);
		                  oldEventlist.barEvent.push(newEvent);
                          db.set('barsEvent:'+req.params.bid, JSON.stringify(oldEventlist), function(err, rep){
                              res.type('json').send(oldEventlist).end();			
                          });
                          }         
		              });
                
                }
                else{
                    res.status(404).type('text').send("Der User mit der ID " +req.params.id + " darf die Bar mit der ID " + req.params.bid + " nicht    verändern");
                }
        }
        else{
            res.status(404).type('text').send("Die Bar mit der ID " + req.params.bid + " wurde nicht gefunden");
        }
    });
});

app.put('/user/:id/bars/:bid/sitzplaetze', function(req, res){
    db.exists('bars:'+req.params.bid, function(err, rep){
        if(rep === 1){
            db.get('bars:'+ req.params.bid, function(err, rep){
                if(rep){
                    rep=JSON.parse(rep);
                    if(rep.userID == req.params.id){
                        var newSp = req.body;
                        db.get('bars:'+req.params.bid+'/sitzplaetze', function(err, rep){
                            if(rep){
                                var temp = JSON.parse(rep);
                                if(newSp.asp > temp.sitzplaetze){ //achtung!!! Groß und Kleinschreibung
                                    res.send("Der neue asp wert ist zu hoch!");
                                } 
                                else{
                                    delete temp.asp;
                                    temp.asp = newSp.asp;
                                    db.set('bars:'+req.params.bid+'/sitzplaetze', JSON.stringify(temp),function(err, rep){
			                             res.send("aktuell").end();
		                            });
                                }
                            }
                            else{
                                res.status(404).type('text').send("Die Bar mit der ID " + req.params.bid + " wurde nicht gefunden");
                            }
                        });
                    }
                    else{
                        res.status(404).type('text').send("Dieser Benutzer darf die Bar mit der ID " + req.params.bid + " nicht verändern!");
                    }
                }
                else{
                    res.status(404).type('text').send("Die Bar mit der ID " + req.params.bid + " wurde nicht gefunden");
                }
                
            });
        }
    });
});
    
//ausgabe einer Liste der Bars die in der Stadt geöffnet hat.

app.get('/bars', function(req, res){
    var data = [];
    db.keys('bars:*', function(err, rep){
                if(rep.length == 0){
                    res.status(404).type('text').send("Keine Bars vorhanden!");
                } else {
                    db.mget(rep, function(err, rep){
                        rep.forEach(function(val){
                            data.push(JSON.parse(val));         
                        });
                        
                        data = data.map(function(bars){
                            return {id: bars.bid, name: bars.name, userID: bars.userID};
                        });
                        
                        var i = 0, p = 0;
                        var temp = [];
                        while(i < data.length){
                            if(JSON.stringify(data[i].id) === undefined){
                            } else { temp[p++] = data[i]; }
                            i++;
                        }
                        data = temp;
                        console.log(data);
                        res.send(data);
                    });
                }
       
    });

});


app.get('/suchbars', function(req, res){
    var data = [];
    
    async.series([
        function(callback){ //Liste aller Bars erstellen
            db.keys('bars:*', function(err, rep){
                if(rep.length == 0){
                    res.status(404).type('text').send("Keine Bars vorhanden!");
                } else {
                    db.mget(rep, function(err, rep){
                        rep.forEach(function(val){
                            data.push(JSON.parse(val));         
                        });
                        data = data.map(function(bars){
                            return {id: bars.bid, name: bars.name, adresse: bars.adresse, stadt: bars.stadt, typ: bars.typ, gegebenheiten: bars.gegebenheiten};
                        });
                        //console.log(data);
                        var i = 0, p = 0;
                        var temp = [];
                        while(i < data.length){
                            if(JSON.stringify(data[i].id) === undefined){
                            } else { temp[p++] = data[i]; }
                            i++;
                        }
                        data = temp;
                        
                        callback();
                    }); 
                }
            });
        },
        function(callback){
            var test, temp = [];
            var currentdate = new Date();
            var tag = currentdate.getDay(); //aktueller tag, 0-6, 0 == sonntag
            var stunde = currentdate.getHours(); //aktuelle stunde
            var i = 0;
            /*var i = 0, j = 0, p = 0;
            while(j < data.length){
                if(data[j] === undefined){
                } else { 
                    temp[p++] = data[j]; 
                }
                j++;
            }
            data = temp;*/
            async.forEach(data, function(bars, callback){
                db.get('bars:' + bars.id + '/oeffnungszeiten', function(err, rep){
                   if(rep){
                       var zeiten = JSON.parse(rep); 
                       if(rep){
                            switch(tag){
                                case 1:
                                    if(zeiten.montagvon <= stunde && zeiten.montagbis >= stunde){
                                        data[i++].offen = "true";
                                    }   
                                    else{
                                        data[i++].offen = "false";
                                    }					       
                                    break;
			         
                                case 2:                                   
                                    if(zeiten.dienstagvon <= stunde && zeiten.dienstagbis >= stunde){
                                        data[i++].offen = "true";
                                    }
                                    else{
                                        data[i++].offen = "false";
                                    }
                                    break;
                                case 3:
                                    if(zeiten.mittwochvon <= stunde && zeiten.mittwochbis >= stunde){
                                        data[i++].offen = "true";
                                    }
                                    else{
                                        data[i++].offen = "false";
                                    }
                                    break;
                                case 4:
                                    if(zeiten.donnerstagvon <= stunde && zeiten.donnerstagbis >= stunde){
                                        data[i++].offen = "true";
                                    }
                                    else{
                                        data[i++].offen = "false";
                                    }
                                    break;
                                case 5:
                                    if(zeiten.freitagvon <= stunde && zeiten.freitagbis >= stunde){
                                        data[i++].offen = "true";
                                    }
                                    else{
                                        data[i++].offen = "false";
                                    }
                                    break;
                                case 6:
                                    if(zeiten.samstagvon <= stunde && zeiten.samstagbis >= stunde){
                                        data[i++].offen = "true";
                                    }
                                    else{
                                        data[i++].offen = "false";
                                    }
                                    break;
                                case 0:
                                    if(zeiten.sonntagvon <= stunde && zeiten.sonntagbis >= stunde){
                                        data[i++].offen = "true";
                                    }
                                    else{
                                        data[i++].offen = "false";
                                    }
                                    break;
                            }
                           callback();
                       }
                   }
                       
                });
            }, callback);
        },
        function(callback){
            var i = 0;
            async.forEach(data, function(bars, callback){
                db.get('bars:' + bars.id + '/sitzplaetze', function(err, rep){
                    if(rep){
                        var temp = JSON.parse(rep);
                        data[i].sitzplaetze = temp.sitzplaetze;
                        data[i++].asp = temp.asp;
                    }
                    callback();
                });
            }, callback);
        }
    
    ], function(){
        res.send(data);
    });                   
});



//Ausgabe des Users
//Benötigt: (UserID)
//Ausgabe: UserID, Username
app.get('/user/:id', function(req, res){
    db.get('user:'+req.params.id, function(err, rep){
       if(rep){
           res.type('json').send(rep);
       }
       else{
           res.status(404).type('text').send("Der User mit der ID " + req.params.id + " wurde nicht gefunden");
       }
   });
});

//Ausgabe der Bar
//Benötigt: (BarID)
//Ausgabe: BarID, Barname
app.get('/bars/:bid', function(req, res){
            db.get('bars:'+req.params.bid, function(err, rep){
                if(rep){
                    res.type('json').send(rep);
                }
                else{
                    res.status(404).type('text').send("Die Bar mit der ID " + req.params.bid + " wurde nicht gefunden");
                }
            });
   });







app.get('/bars/:bid/aktuell', function(req, res){
    var currentdate = new Date();
	var tag = currentdate.getDay(); //aktueller tag, 0-6, 0 == sonntag
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
    var bid = req.params.bid;
    var temp = {};
    
    async.series([
        function(callback){
            db.get('bars:'+ bid + '/oeffnungszeiten', function(err, rep){
                var zeiten = JSON.parse(rep);
                if(rep){
                    switch(tag){
                        case 1:
                            if(zeiten.montagvon <= stunde && zeiten.montagbis >= stunde){
						      temp.offen = "true";
					       }
					       else{
						      temp.offen = "false";
					       }
					       break;
			         case 2:
					       if(zeiten.dienstagvon <= stunde && zeiten.dienstagbis >= stunde){
						      temp.offen = "true";
					       }
					       else{
						      temp.offen = "false";
					       }
					       break;
			         case 3:
					       if(zeiten.mittwochvon <= stunde && zeiten.mittwochbis >= stunde){
						      temp.offen = "true";
					       }
					       else{
						      temp.offen = "false";
					       }
					       break;
			         case 4:
					       if(zeiten.donnerstagvon <= stunde && zeiten.donnerstagbis >= stunde){
						      temp.offen = "true";
					       }
					       else{
						      temp.offen = "false";
					       }
					       break;
			         case 5:
					       if(zeiten.freitagvon <= stunde && zeiten.freitagbis >= stunde){
						      temp.offen = "true";
					       }
					       else{
                               temp.offen = "false";
					       }
					       break;
			         case 6:
					       if(zeiten.samstagvon <= stunde && zeiten.samstagbis >= stunde){
						      temp.offen = "true";
					       }
					       else{
						      temp.offen = "false";
					       }
					       break;
			         case 0:
                            if(zeiten.sonntagvon <= stunde && zeiten.sonntagbis >= stunde){
                                temp.offen = "true";
					       }
					       else{
                               temp.offen = "false";
					       }
					       break;
                    }
                    callback();
                } else {
                    res.status(404).type('text').send("Die Bar mit der ID " + req.params.bid + " wurde nicht gefunden");
                }      
            });
        },
        function(callback){
            if(temp.offen == "true"){
                db.get('bars:'+ bid+'/sitzplaetze', function(err, rep){
                    if(rep){
                        temp.sitzplaetze = JSON.parse(rep);
                    }
                    callback();
                });
            }
            
        },
        function(callback){
            db.get('barsEvent:' + bid, function(err, rep){
                if(rep){
                    var events = JSON.parse(rep);
                    for(var i = 0; i < events.barEvent.length; i++){
                        if(today == events.barEvent[i].date){
                            temp.event = events.barEvent[i];
                        }
                    }
                }
                callback();
            });
        }
    ], function(){
        res.send(temp);
    });
});





//Ausgabe der Details einer Bar
//Benötigt: (BarID)
//Ausgabe: Sitzplaetze, Adresse, Typ, Behindertengerecht, Gegebenheiten


app.get('/bars/:bid/sitzplaetze', function(req, res){
    db.exists('bars:'+req.params.bid, function(err, rep){
        if(rep === 1){
            db.get('bars:'+ req.params.bid+'/sitzplaetze', function(err, rep){
                if(rep){
                    var temp = rep;
                    res.send(JSON.parse(temp));
                }
                else{
                    res.status(404).type('text').send("Die Sitzplätze der Bar mit der ID " + req.params.bid + " wurde nicht gefunden");
                }
             });
        }
        else{
                res.status(404).type('text').send("Die Bar mit der ID " + req.params.bid + " wurde nicht gefunden");
        }
    });
});



app.get('/bars/:bid/oeffnungszeiten', function(req, res){
    db.exists('bars:'+req.params.bid, function(err, rep){
        if(rep === 1){
            db.get('bars:'+ req.params.bid+'/oeffnungszeiten', function(err, rep){
            if(rep){
                res.send(JSON.parse(rep));
            }
            else{
                res.status(404).type('text').send("Die Öffnungszeiten der Bar mit der ID " + req.params.bid + " wurde nicht gefunden");
            }
            });
        }
        else{
                res.status(404).type('text').send("Die Bar mit der ID " + req.params.bid + " wurde nicht gefunden");
        }
            
    });
});

//Ausgabe der Karte einer Bar
//Benötigt: (BarID)
//Ausgabe: ggf. Getränke
app.get('/bars/:bid/getraenkekarte', function(req, res){ //Rückgabe der Karte der Bar mittels id
   db.exists('bars:' + req.params.bid, function(err, rep){
       if(rep === 1){
            db.get('bars:'+req.params.bid+'/karte', function(err, rep){
                if(rep){
                    var temp = JSON.parse(rep);
                    res.send(temp).end();
                }
                else{
                    res.status(404).type('text').send("Die Karte der Bar mit der ID " + req.params.bid + " wurde nicht gefunden");
                }
            });
       }
       else {
            res.status(404).type('text').send("Die Bar mit der ID " + req.params.bid + " wurde nicht gefunden");
       }
   });
});
    

app.get('/bars/:bid/events', function(req, res){
	db.get('barsEvent:'+req.params.bid, function(err, rep){
		if(rep){
			res.type('json').send(rep);
		}
       else{
           res.status(404).type('text').send("Für die Bar mit der ID " + req.params.bid + " wurden keine Events gefunden");
       }
   });
});	


app.delete('/user/:id', function(req, res){
    db.exists('user:'+req.params.id, function(err, rep){
        if(rep === 1){
            db.del('user:'+req.params.id,function(err, rep){
                var temp = JSON.parse(rep);
                    res.send(temp);
            });
        }
        else{
            res.status(404).send("Der User wurde nicht gefunden!").end();   
        }
    });
});

app.delete('/bars/:bid', function(req, res){
    db.exists('bars:'+req.params.bid, function(err, rep){
        if(rep === 1){
            db.del('bars:'+req.params.bid,function(err, rep){
                var temp = JSON.parse(rep);
                    res.send(temp).end();
            });
        }
        else{
            res.status(404).send("Die Bar wurde nicht gefunden!").end();   
        }
    });
});
    

app.listen(3000);