var http = require('http');
var express = require('express');
var fs = require('fs');
var ejs = require('ejs');
var bodyparser = require('body-parser');

var jsonParser = bodyparser.json();
var app = express();

app.use(express.static(__dirname + '/pages'));

app.set('view engine', 'ejs');

//Hauptseite
app.get('/', function(req, res) {
  res.render('pages/index');
});

//Barsseite
app.get('/bars/:id', function(req, res) {
  res.render('pages/bars');
});

//Barsseite-Aktuell
app.get('/bars/:id/aktuell', function(req, res) {
  res.render('pages/barsaktuell');
});

//Barsseite-Deteils
app.get('/bars/:id/details', function(req, res) {
  res.render('pages/barsdetails');
});

//Barsseite-Sitzplaetze
app.get('/bars/:id/sitzplaetze', function(req, res) {
  res.render('pages/barssitzplätze');
});

// Weitere Seiten hinzufügen (POST, PUT, DELETE)
