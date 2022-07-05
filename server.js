const PORT = 8090;
var express = require('express');
var recipeTools = require('./recipe_generator');
// formidable helps get JSON POST request content
const formidable = require('express-formidable');
var compile = require('es6-template-strings/compile'),
    resolveToString = require('es6-template-strings/resolve-to-string'),
    fs = require('fs');
// create a function that can convert from recipe template literal -> new recipe markdown
const recipeMarkdownDir = "./recipes/";
recipe_template_raw = fs.readFileSync(recipeMarkdownDir + "template/recipe_template.md", "utf-8");
compiledRecipeTemplate = compile(recipe_template_raw);

var app = express();

app.use(formidable());

console.log('Starting express server on port ' + PORT);

// set the view engine to ejs
app.set('view engine', 'ejs');

// add folder for static content:
app.use(express.static(__dirname + '/assets'));

// Get method for all pages
app.get(/\/.*/, function (req, res) {
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
            page = 'partials/md/projects/' + page;
        }
        else if (pathname.includes('recipes') && page !== 'index') {
            pathname = pathname.substr(0, pathname.lastIndexOf(page));
            pathname += 'recipe_template'
            // provide the pagename for project_template to use for main content
            page = 'partials/md/recipes/' + page;
        }
    }
    console.log('request for path: ' + pathname + ', and page: ' + page);

    res.render(pathname, { "page": page });
});

function toCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

// When a user successfully submits a new recipe a post request with
// JSON content of recipe data ends up here
app.post("/new_recipe", function (req, res) {
    let dataIn = req.fields;

    filename = toCamelCase(dataIn.recipe_name_input) + ".md";
    if (fs.existsSync(recipeMarkdownDir + filename)) {
        res.status(409).send(`Already have a recipe with name "${dataIn.recipe_name_input}"`);
        return;
    }

    // TODO: more input checking

    // add a '#' to all the tags in the input list
    formatted_tags = dataIn.tag_input.split(",")
        .map(elem => "#" + elem)
        .join(" ");

    dataIn.tags = formatted_tags

    formattedMarkdownRecipe = resolveToString(compiledRecipeTemplate, dataIn);
    fs.writeFileSync(recipeMarkdownDir + filename, formattedMarkdownRecipe, 'utf-8');

    recipeTools.generateRecipePartials(filename);
    recipeTools.generateRecipeNavPartials()

    res.send('Successfully added!');
});

app.listen(PORT);
