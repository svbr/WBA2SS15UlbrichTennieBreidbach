var http = require('http');
var express = require('express');
var fs = require('fs');
var ejs = require('ejs');
var bodyparser = require('body-parser');

var jsonParser = bodyparser.json();
var app = express();

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
          if(externalResponse.statusCode == 404){
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

app.get('/search1', function(req, res) {
    var search = req.body;
    console.log(search);
   fs.readFile("./views/pages/search.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
      var options = {
        host: "localhost",
        port: 3000,
        path: "/suchbars",
        method:"GET",
        headers:{
          accept:"application/json"
        }
      }
      var externalRequest = http.request(options, function(externalResponse){
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
app.get('/login', function(req, res) {
	res.render('./pages/login.ejs');
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
					console.log("Got response: " + externalResponse.statusCode);
					res.render('./pages/barsnotfound.ejs');
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
    var bar, sitzplatz, events;
    
  fs.readFile("./views/pages/bar.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
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
          /*var html = ejs.render(filestring, {bars: bars, filename: __dirname + '/bars.ejs'});
          res.setHeader("content-type", "text/html");
          res.writeHead(200);
          res.write(html);
          res.end();*/
            bar = bars;
        });
      });
      externalRequest.end();
    }
  });
    fs.readFile("./views/pages/bar.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
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
          /*var html = ejs.render(filestring, {bars: bars, filename: __dirname + '/bars.ejs'});
          res.setHeader("content-type", "text/html");
          res.writeHead(200);
          res.write(html);
          res.end();*/
            sitzplatz = sitzplaetze;
        });
      });
      externalRequest.end();
    }
  });
    fs.readFile("./views/pages/bar.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
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
          /*var html = ejs.render(filestring, {bars: bars, filename: __dirname + '/bars.ejs'});
          res.setHeader("content-type", "text/html");
          res.writeHead(200);
          res.write(html);
          res.end();*/
            events = event;
        });
      });
      externalRequest.end();
    }
  });
    // getränkekarte fehlt!!!!
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
                
              var html = ejs.render(filestring, {oeffnungszeiten: oeffnungszeiten, bars: bar, sitzplaetze: sitzplatz, events: events,  filename: __dirname + '/bars.ejs'});
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
   fs.readFile("./views/pages/add.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
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
          var html = ejs.render(filestring, {sitzplaezte: sitzplaezte, filename: __dirname + '/views/pages/add.ejs'});
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
      externalRequest.write(JSON.stringify(sitzplaetze));
      externalRequest.end();
    }
});
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
