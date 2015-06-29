var http = require('http');
var express = require('express');
var fs = require('fs');
var ejs = require('ejs');
var bodyparser = require('body-parser');

var jsonParser = bodyparser.json();
var app = express();

app.use('/public', express.static(__dirname + '/public'));

// Lokale Variable, wird an html weiter gegeben
app.locals.title = 'Kneipentour';

// json Datei einlesen
app.all('*', function(req, res, next) {
  fs.readFile('posts.json', function(err, data) {
    res.locals.posts = JSON.parse(data);
    next();
  });
});

//app.set('view engine', 'ejs');

//Hauptseite wird aufgerufen
app.get('/', function(req, res) {
  res.render('index.ejs');
});

app.get('/post/:bar', function(req, res, next) {
  res.locals.posts.forEach(function(post) {
    if (req.params.bar === post.bar) {
      res.render('post.ejs', { post: post });
    }
  })
});

/*

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
*/

//Gibt JSON aus
app.get('/api/posts', function(req, res) {
  res.json(res.locals.posts);
});

app.listen(3000);
console.log('app is listening at localhost:3000');
