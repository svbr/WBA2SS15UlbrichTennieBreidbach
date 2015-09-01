var http = require('http');
var express = require('express');
var fs = require('fs');
var ejs = require('ejs');
var bodyparser = require('body-parser');

var jsonParser = bodyparser.json();
var app = express();
var server = http.createServer(app);


app.use(jsonParser);
//app.use('/views', express.static(__dirname + '/views'));

// set the view engine to ejs
//app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
	res.render('./pages/index.ejs');
});

app.get('/user', function(req, res){
    fs.readFile("./views/pages/add.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
      var options = {
        host: "localhost",
        port: 3000,
        path: "/user",
        method:"GET",
        headers:{
          accept:"application/json"
        }
      }
      var externalRequest = http.request(options, function(externalResponse){
          console.log("Connected User get");
          if(externalResponse.statusCode == 404){ // das muss umebdingt noch überarbeitet werden (statuscodes) !!
              console.log("kein Nutzer vorhanden");
              var noUser = {
                  id: "-1",
              };

              res.send(noUser);
              res.end();
          } else {
                externalResponse.on("data", function(chunk){
                var user = JSON.parse(chunk);
                console.log(user);
                res.send(user);
                res.end();
            });
          }
      });
      externalRequest.end();
    }
});

});



// Suche
app.get('/search', function(req, res) {
	res.render('./pages/search.ejs');
});

app.get('/aktuell', function(req, res) {
    var search = req.body;
    console.log(search);
   fs.readFile("./views/pages/search.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
      var options = {
        host: "localhost",
        port: 3000,
        path: "/aktuell",
        method:"GET",
        headers:{
          accept:"application/json"
        }
      }
      var externalRequest = http.request(options, function(externalResponse){
        if(externalResponse.statusCode == 404){
            console.log("Got response: " + externalResponse.statusCode);
            var status = externalResponse.statusCode;
            externalResponse.on("data", function(chunk){
                var fehlermeldung = chunk;
                var fehler = {};
                fehler.status = status;
                fehler.fehlermeldung = fehlermeldung;
                
                var html = ejs.render('./pages/barsnotfound.ejs', {fehler: fehler, filename: __dirname + '/views/pages/barsnotfound.ejs'});
                res.setHeader("content-type", "application/json");
                res.writeHead(404);
                res.end();
            });
        } else {
            console.log("Connected Bars get");
            externalResponse.on("data", function(chunk){
                var bars = JSON.parse(chunk);
                var temp = [];
                var k = 0;
                /*for(var i = 0; i < bars.length; i++){
                    if(search.stadt == bars[i].stadt){
                        temp[k++] = bars[i];
                    }
                }
                bars = temp;*/
                console.log(bars);
              //var html = ejs.render(filestring, {bars: bars, filename: __dirname + '/views/pages/search.ejs'});
              //res.setHeader("content-type", "application/json");
              //res.writeHead(200);
              res.send(bars);
              res.end();
            });
        }
      });
      externalRequest.end();
    }
});
});

// about page
app.get('/about', function(req, res) {
	res.render('./pages/about.ejs');
});

// Login
app.get('/profil', function(req, res) {
	res.render('./pages/profil.ejs');
});

app.post('/profil', function(req, res) {
	var test = req.body;
	console.log(test);
	fs.readFile("./views/pages/profil.ejs", {encoding:"utf-8"}, function(err, filestring){
	 if(err){
		 throw err;
	 } else{
		 var options = {
			 host: "localhost",
			 port: 3000,
			 path: "/user/",
			 method:"POST"
		 }
		 var externalRequest = http.request(options, function(externalResponse){
		 	console.log("Connected User post");
			externalResponse.on("data", function(chunk){
			          var user = JSON.parse(chunk);
								console.log(user);
            res.send(user);
          res.end();
				});
			});
		}
	});
});

//User anlegen / registrieren
app.get('/register', function(req, res) {
	res.render('./pages/register.ejs');
});

app.post('/register', function(req, res){
    var test = req.body;
    console.log(test);
   fs.readFile("./views/pages/register.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
      var options = {
        host: "localhost",
        port: 3000,
        path: "/user",
        method:"POST"
      }
			var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected User post");
				externalResponse.on("data", function(chunk){
          var newUser = JSON.parse(chunk);
					var html = ejs.render(filestring, {newUser: newUser, filename: __dirname + '/views/pages/register.ejs'});
					res.setHeader("content-type", "text/html");
          res.writeHead(200);
          res.write(html);
          res.end();
				});
			});
			externalRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });
      externalRequest.setHeader("content-type", "application/json");
      externalRequest.write(JSON.stringify(test));
      console.log(test);
      externalRequest.end();
    }
});
});

// Alle bars auflisten
app.get('/bars', function(req, res){
    fs.readFile("./views/pages/bars.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
      var options = {
        host: "localhost",
        port: 3000,
        path: "/bars",
        method:"GET",
        headers:{
          accept:"application/json"
        }
      }
      var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected Bars get");
        if(externalResponse.statusCode == 404){
            fs.readFile("./views/pages/barsnotfound.ejs", {encoding:"utf-8"}, function(err, filestring){
                if(err){
                  throw err;
                } else{
                    console.log("Got response: " + externalResponse.statusCode);
                    var status = externalResponse.statusCode;
                    externalResponse.on("data", function(chunk){
                        var fehlermeldung = chunk.toString();
                        console.log(fehlermeldung);
                        var fehler = {};
                        fehler.status = status;
                        fehler.fehlermeldung = fehlermeldung;
                        var html = ejs.render(filestring , {fehler: fehler, filename: __dirname + '/barsnotfound.ejs'});
                        res.setHeader("content-type", "text/html");
                        res.writeHead(200);
                        res.write(html);
                        res.end();
                    });
                }
            });
        } else {
            externalResponse.on("data", function(chunk){

                var bars = JSON.parse(chunk);
                var html = ejs.render(filestring, {bars: bars, filename: __dirname + '/bars.ejs'});
                res.setHeader("content-type", "text/html");
                res.writeHead(200);
                res.write(html);
                res.end();
            });
        }
      });
      externalRequest.end();
    }
  });
});

// Bar Seite
// eine Bar auflisten
app.get("/bars/:bid", function(req, res, next){
    var bar, sitzplatz, events, getränk;
    //Get bars
    var options = {
        host: "localhost",
        port: 3000,
        path: "/bars/"+req.params.bid,
        method:"GET",
        headers:{
          accept:"application/json"
        }
      }
      var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected Bars get");
        externalResponse.on("data", function(chunk){
            var bars = JSON.parse(chunk);
            bar = bars;
        });
      });
    externalRequest.end();
    //GET bars/:id/sitzplätze
    var options = {
        host: "localhost",
        port: 3000,
        path: "/bars/"+ req.params.bid + "/sitzplaetze",
        method:"GET",
        headers:{
          accept:"application/json"
        }
      }
      var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected sitzplaetze get");
        externalResponse.on("data", function(chunk){
            var sitzplaetze = JSON.parse(chunk);
            sitzplatz = sitzplaetze;
        });
      });  
    externalRequest.end();
    //GET bars/:id/events
    var options = {
        host: "localhost",
        port: 3000,
        path: "/bars/"+ req.params.bid + "/events",
        method:"GET",
        headers:{
          accept:"application/json"
        }
      }
      var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected events get");
        externalResponse.on("data", function(chunk){
            var event = JSON.parse(chunk);
            events = event;
        });
      });  
    externalRequest.end();
    //GET bars/:id/getränkekarte
      var options = {
        host: "localhost",
        port: 3000,
        path: "/bars/"+ req.params.bid + "/getraenkekarte",
        method:"GET",
        headers:{
          accept:"application/json"
        }
      }
      var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected getränkekarte get");
        externalResponse.on("data", function(chunk){
            var gk = JSON.parse(chunk);
            getränk = gk;
        });
      });
      externalRequest.end();
    //GET bars/:id/öffnungszeiten
    fs.readFile("./views/pages/bar.ejs", {encoding:"utf-8"}, function(err, filestring){
        if(err){
          throw err;
        } else{
          var options = {
            host: "localhost",
            port: 3000,
            path: "/bars/"+req.params.bid + "/oeffnungszeiten",
            method:"GET",
            headers:{
              accept:"application/json"
            }
          }
          var externalRequest = http.request(options, function(externalResponse){
            console.log("Connected oeffnungszeiten get");
            externalResponse.on("data", function(chunk){
              var oeffnungszeiten = JSON.parse(chunk);

              var html = ejs.render(filestring, {oeffnungszeiten: oeffnungszeiten, bars: bar, sitzplaetze: sitzplatz, events: events, getraenk: getränk, filename: __dirname + '/bars.ejs'});
              res.setHeader("content-type", "text/html");
              res.writeHead(200);
              res.write(html);
              res.end();
            });
          });
          externalRequest.end();
        }
  });
});

app.get("/user/:id", function(req, res, next){
  fs.readFile("./views/pages/user.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
      var options = {
        host: "localhost",
        port: 3000,
        path: "/user/"+req.params.id,
        method:"GET",
        headers:{
          accept:"application/json"
        }
      }
      var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected User get");
        externalResponse.on("data", function(chunk){
          var user = JSON.parse(chunk);
          var html = ejs.render(filestring, {user: user, filename: __dirname + '/user.ejs'});
          res.setHeader("content-type", "text/html");
          res.writeHead(200);
          res.write(html);
          res.end();
        });
      });
      externalRequest.end();
    }
  });
});

app.get('/add', function(req, res){
    res.render('./pages/add.ejs');

});

//Bar anlegen
app.post('/add', function(req, res){
    var test = req.body;
    console.log(test);
    var user = test.userID;
    console.log(user);

   fs.readFile("./views/pages/add.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
      var options = {
        host: "localhost",
        port: 3000,
        path: "/user/" + user + "/bars",
        method:"POST"
      }
      var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected Bars post");
        externalResponse.on("data", function(chunk){
          var newBar = JSON.parse(chunk);
          //var html = ejs.render(filestring, {newBar: newBar, filename: __dirname + '/views/pages/add.ejs'});
          //res.setHeader("content-type", "text/html");
          //res.writeHead(200);
          //res.write(html);
            console.log(newBar);
            res.send(newBar);
          res.end();
        });
      });
      externalRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });
      externalRequest.setHeader("content-type", "application/json");
      externalRequest.write(JSON.stringify(test));
      console.log(test);
      externalRequest.end();
    }
});
});

app.post('/user/:id/bars/:bid/oeffnungszeiten', function(req, res){
    var oeffnungszeiten = req.body;
    console.log(oeffnungszeiten);
   fs.readFile("./views/pages/add.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
      var options = {
        host: "localhost",
        port: 3000,
        path: "/user/" + req.params.id + "/bars/" + req.params.bid + "/oeffnungszeiten",
        method:"POST"
      }
      var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected oeffnungszeiten post");
        externalResponse.on("data", function(chunk){
          var oeffnungszeiten = JSON.parse(chunk);
          var html = ejs.render(filestring, {oeffnungszeiten: oeffnungszeiten, filename: __dirname + '/views/pages/add.ejs'});
          res.setHeader("content-type", "text/html");
          res.writeHead(200);
          res.write(html);
          res.end();
        });
      });
      externalRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });
      externalRequest.setHeader("content-type", "application/json");
      externalRequest.write(JSON.stringify(oeffnungszeiten));
      externalRequest.end();
    }
});
});

app.post('/user/:id/bars/:bid/sitzplaetze', function(req, res){
    var sitzplaetze = req.body;
    console.log(sitzplaetze);
    
      var options = {
        host: "localhost",
        port: 3000,
        path: "/user/" + req.params.id + "/bars/" + req.params.bid + "/sitzplaetze",
        method:"POST"
      }
      var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected sitzplaetze post");
        externalResponse.on("data", function(chunk){
            var sitzplaezte = JSON.parse(chunk);
            
            res.status(200);
            res.end();
        });
      });
      externalRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });
      externalRequest.setHeader("content-type", "application/json");
      externalRequest.write(JSON.stringify(sitzplaetze));
      externalRequest.end();
    
});

app.delete('user/:id/bars/:bid', function(req, res){
    console.log('test2');

    var options = {
        host: "localhost",
        port: 3000,
        path: "/user/"+ req.params.id +"/bars/"+req.params.bid,
        method:"DELETE",
        headers:{
          accept:"application/json"
        }
    }
    var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected Bar delete");
        externalResponse.on("data", function(chunk){

            res.status(200);
            res.end();
        });
      });
      externalRequest.end();
});

app.put('/user/:id', function(req, res){
    console.log('test3');
    var neu = req.body;
    
    var options = {
        host: "localhost",
        port: 3000,
        path: "/user/" + req.params.id,
        method:"PUT",
        headers:{
          accept:"application/json"
        }
    }
    var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected User PUT");
        externalResponse.on("data", function(chunk){
          
            res.status(200);
            res.end();
        });
      });
      externalRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });
      externalRequest.setHeader("content-type", "application/json");
      externalRequest.write(JSON.stringify(neu));
      externalRequest.end();
});

app.put('/user/:id/bars/:bid', function(req, res){
    console.log('test2');
    var neu = req.body;

    var options = {
        host: "localhost",
        port: 3000,
        path: "/user/" + req.params.id + "/bars/"+req.params.bid,
        method:"PUT",
        headers:{
          accept:"application/json"
        }
    }
    var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected Bar PUT");
        externalResponse.on("data", function(chunk){

            res.status(200);
            res.end();
        });
      });
      externalRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });
      externalRequest.setHeader("content-type", "application/json");
      externalRequest.write(JSON.stringify(neu));
      externalRequest.end();
});

app.put('/user/:id/bars/:bid/oeffnungszeiten', function(req, res){
    console.log('test2');
    var neu = req.body;

    var options = {
        host: "localhost",
        port: 3000,
        path: "/user/" + req.params.id + "/bars/"+req.params.bid +'/oeffnungszeiten',
        method:"PUT",
        headers:{
          accept:"application/json"
        }
    }
    var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected oeffnungszeiten PUT");
        externalResponse.on("data", function(chunk){
            res.status(200);
            res.end();
        });
      });
      externalRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });
      externalRequest.setHeader("content-type", "application/json");
      externalRequest.write(JSON.stringify(neu));
      externalRequest.end();
});

app.delete('/user/:id', function(req, res){

    var options = {
        host: "localhost",
        port: 3000,
        path: "/user/"+req.params.id,
        method:"DELETE",
        headers:{
          accept:"application/json"
        }
    }
    var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected User delete");
        externalResponse.on("data", function(chunk){

            res.status(200);
            res.end();
        });
      });
      externalRequest.end();
});


app.delete('/user/:id/bars/:bid/events', function(req, res){

	var options = {
	        host: "localhost",
	        port: 3000,
	        path: "/user/"+ req.params.id +"/bars/" + req.params.bid + "/events",
	        method:"DELETE",
	        headers:{
	          accept:"application/json"
	        }
	    }
        var externalRequest = http.request(options, function(externalResponse){    
            console.log("Connected Event delete");
            externalResponse.on("data", function(chunk){
                res.status(200);
                res.end(); 
            });
        });
        externalRequest.end();

});


app.post("/user/:id/bars/:bid/getraenkekarte", function(req, res){
    var getraenkekarte = req.body;
    console.log(getraenkekarte);
    
    var options = {
        host: "localhost",
        port: 3000,
        path: "/user/" + req.params.id + "/bars/" + req.params.bid + "/getraenkekarte",
        method:"POST"
      }
    
    var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected getraenkekarte post");
        externalResponse.on("data", function(chunk){
            var getränkekarte = JSON.parse(chunk);
            res.status(200);
            res.end();
        });
      });
      externalRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });
      externalRequest.setHeader("content-type", "application/json");
      externalRequest.write(JSON.stringify(getraenkekarte));
      externalRequest.end();
    
});

app.put("/user/:id/bars/:bid/getraenkekarte", function(req, res){
    var neu = req.body;
    console.log(neu);
    
    var options = {
        host: "localhost",
        port: 3000,
        path: "/user/" + req.params.id + "/bars/"+ req.params.bid + "/getraenkekarte",
        method:"PUT",
        headers:{
          accept:"application/json"
        }
    }
    console.log(options.path);
    var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected getraenkekarte PUT");
        externalResponse.on("data", function(chunk){
            res.status(200);
            res.end();
        });
      });
      externalRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });
      externalRequest.setHeader("content-type", "application/json");
      externalRequest.write(JSON.stringify(neu));
      externalRequest.end();
});

app.post('/user/:id/bars/:bid/events', function(req, res){
    var events = req.body;
    console.log(events);
    
      var options = {
        host: "localhost",
        port: 3000,
        path: "/user/" + req.params.id + "/bars/" + req.params.bid + "/events",
        method:"POST"
      }
      var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected events post");
        externalResponse.on("data", function(chunk){
            var events = JSON.parse(chunk);
            // das muss auf jeden fall bearbeitet werden (statuscode)!!
            res.status(200);
            res.end();
        });
      });
      externalRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });
      externalRequest.setHeader("content-type", "application/json");
      externalRequest.write(JSON.stringify(events));
      externalRequest.end();
    
});

app.put('/user/:id/bars/:bid/sitzplaetze', function(req, res){
    var neu = req.body;
    console.log(neu);
    var options = {
        host: "localhost",
        port: 3000,
        path: "/user/" + req.params.id + "/bars/"+req.params.bid +'/sitzplaetze',
        method:"PUT",
        headers:{
          accept:"application/json"
        }
    }
    var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected sitzplaetze PUT");
        externalResponse.on("data", function(chunk){
            res.status(200);
            res.end();
        });
      });
      externalRequest.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });
      externalRequest.setHeader("content-type", "application/json");
      externalRequest.write(JSON.stringify(neu));
      externalRequest.end();
});


// Weitere Seiten
/*
// Aktuell in einer Stadt??
app.get('/bars/:id/aktuell', function(req, res) {
  res.render('pages/barsaktuell');
});

// Details einer Bar
app.get('/bars/:id/details', function(req, res) {
  res.render('pages/barsdetails');
});
*/
app.listen(8080);
console.log('8080 is the magic port');
