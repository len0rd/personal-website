var express = require('express');
var app = express();

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load an ejs view file

app.get('/', function(req, res) {
    res.render('pages/index');
});

app.get('/about', function(req, res) {
    res.render('pages/about');
});

app.listen(8080);