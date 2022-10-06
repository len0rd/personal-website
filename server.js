const PORT = 8090;
var express = require('express');
const path = require("path");
var app = express();

console.log('Starting express server on port ' + PORT);

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

// add folder for static content:
app.use(express.static(path.join(__dirname, 'assets')));

function getRootPage(req, res) {
    let pageName = req.params["pageName"];
    if (pageName === null || pageName === undefined) {
        pageName = "index";
    }
    res.render(path.join("pages", pageName));
}

app.get("/:pageName", getRootPage);
app.get("/", getRootPage);

app.get("/projects/:projectName", (req, res) => {
    res.sendFile(req.params["projectName"], { root: path.join(__dirname, "assets", "projects") })
});

app.get("/recipes/:recipeName", (req, res) => {
    let pathname = path.join("pages", "recipes", "recipe_template");
    let page = path.join("partials", "md", "recipes", req.params["recipeName"])
    res.render(pathname, { "page": page });
});

app.listen(PORT);
