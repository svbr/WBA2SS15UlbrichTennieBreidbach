var http = require('http');
var express = require('express');
var fs = require('fs');
var ejs = require('ejs');
var bodyparser = require('body-parser');

var jsonParser = bodyparser.json();
var app = express();

app.use('/views', express.static(__dirname + '/views'));

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
	res.render('pages/index');
});

// about page
app.get('/about', function(req, res) {
	res.render('pages/about');
});

// bars Seite
// alle Bars auflisten
app.get('/bars', function(req, res) {
  res.render('pages/bar');
});

// Aktuell in einer Stadt??
app.get('/bars/:id/aktuell', function(req, res) {
  res.render('pages/barsaktuell');
});

// Details einer Bar
app.get('/bars/:id/details', function(req, res) {
  res.render('pages/barsdetails');
});



app.listen(8080);
console.log('8080 is the magic port');
