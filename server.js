var express = require('express');
var app = express();

console.log('Hello');

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load an ejs view file

app.get('/', function(req, res) {
    res.render('pages/index');
});

// add folder for static content:
app.use(express.static(__dirname + '/assets'));

app.listen(8090);