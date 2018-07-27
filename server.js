var express = require('express');
var app = express();

console.log('Hello');

// set the view engine to ejs
app.set('view engine', 'ejs');

// add folder for static content:
app.use(express.static(__dirname + '/assets'));

app.get(/\/.*/, function(req, res) {
    console.log(req.path);
    let pathname = 'pages' + req.path;

    if ((pathname)[pathname.length - 1] === '/') {
        pathname += 'index';
    }

    res.render(pathname);
});

app.listen(8090);