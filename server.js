const PORT = 8090;
var fs = require('fs');
var https = require('https');
var http = require('http');
var express = require('express');
var app = express();

var credentials;
var useHttps = true;
try {
    var privateKey  = fs.readFileSync('/etc/letsencrypt/live/lenord.me/privkey.pem', 'utf-8');
    var certificate = fs.readFileSync('/etc/letsencrypt/live/lenord.me/fullchain.pem', 'utf-8');
    credentials = {key: privateKey, cert: certificate};
} catch (error) {
    useHttps = false;
    console.warn('WARN::NOT USING HTTPS, reverting to HTTP');
    console.log(error);
}

console.log('Starting express server');

// set the view engine to ejs
app.set('view engine', 'ejs');

// add folder for static content:
app.use(express.static(__dirname + '/assets'));

app.get(/\/.*/, function(req, res) {
    let pathname = 'pages' + req.path;
    let page = pathname.substr(pathname.lastIndexOf('/') + 1);
    
    if (pathname !== null && pathname !== undefined) {
        if ((pathname)[pathname.length - 1] === '/') {
            pathname += 'index';
            page = 'index';
        }
        if (pathname.includes('projects') && page !== 'index') {
            // projects has a custom template that is used for all projects
            // so we need to change the pathname that the renderer is using
            // to that template:
            pathname = pathname.substr(0, pathname.lastIndexOf(page));
            pathname += 'project_template'
            page = 'partials/md/' + page;
        }
    }
    console.log('request for path: ' + pathname + ', and page: ' + page);

    res.render(pathname, {"page": page});
});

if (useHttps) {
    var httpsServer = https.createServer(credentials, app);
    httpsServer.listen(PORT);
} else {
    var httpServer = http.createServer(app);
    httpServer.listen(PORT);
}