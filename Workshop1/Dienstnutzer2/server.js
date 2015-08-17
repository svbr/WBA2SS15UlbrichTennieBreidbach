var http = require('http');
var express = require('express');
var fs = require('fs');
var ejs = require('ejs');
var bodyparser = require('body-parser');

var jsonParser = bodyparser.json();
var app = express();

//app.use('/views', express.static(__dirname + '/views'));

// set the view engine to ejs
//app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
	res.render('./pages/index.ejs');
});

// Suche
app.get('/search', function(req, res) {
	res.render('./pages/search.ejs');
});

// about page
app.get('/about', function(req, res) {
	res.render('./pages/about.ejs');
});

// Login
app.get('/login', function(req, res) {
	res.render('./pages/login.ejs');
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
        externalResponse.on("data", function(chunk){
          var bars = JSON.parse(chunk);
          var html = ejs.render(filestring, {bars: bars, filename: __dirname + '/bars.ejs'});
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

// Bar Seite
// eine Bar auflisten
app.get("/bars/:bid", function(req, res, next){
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
          var html = ejs.render(filestring, {bars: bars, filename: __dirname + '/bars.ejs'});
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

app.post('/add', function(req, res){
    var test = req.body;
    console.log(test);
   fs.readFile("./views/pages/add.ejs", {encoding:"utf-8"}, function(err, filestring){
    if(err){
      throw err;
    } else{
      var options = {
        host: "localhost",
        port: 3000,
        path: "/user/1/bars",
        method:"POST"
      }
      var externalRequest = http.request(options, function(externalResponse){
        console.log("Connected Bars post");
        externalResponse.on("data", function(chunk){
          var newBar = JSON.parse(chunk);
          var html = ejs.render(filestring, {user: newBar, filename: __dirname + '/add.ejs'});
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
