const PORT = 8090;
var express = require('express');
var app = express();

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
            // that template:
            pathname = pathname.substr(0, pathname.lastIndexOf(page));
            pathname += 'project_template'
            // provide the pagename for project_template to use for main content
            page = 'partials/md/' + page;
        }
    }
    console.log('request for path: ' + pathname + ', and page: ' + page);

    res.render(pathname, {"page": page});
});

app.listen(PORT);
