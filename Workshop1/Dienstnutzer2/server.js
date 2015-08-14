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

// bars Seite
// alle Bars auflisten ??
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
