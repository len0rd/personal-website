// convert our markdown documentation files
// to 'static' html/ejs partials:
// while this is a bit inconvenient (you need to restart
// the server everytime you want to see
// md changes), it is more efficient in
// that we aren't converting MD -> ejs
// on EVERY request
const showdown = require('showdown'),
    showdownHighlight = require("showdown-highlight"),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    projectInputDir = './project_writeups/',
    projectOutputDir = './views/partials/md/projects/',
    projectClassMap = {
        h1: 'display-1' //tag type : class to add to all tags of that type (class="display-1" added to all <h1>)
    };
var recipeTools = require('./recipe_generator');


function addClassToTag(text, classMap) {
    var modifiedText = text;
    Object.keys(classMap).forEach(function (key) {
        var regex = new RegExp(`<(${key})(.*?)>`, 'g');
        matcher = regex.exec(modifiedText);

        // only proceed if we found a match, and the class we add isn't already on the tag somehow
        while (matcher != null && !matcher[2].includes(classMap[key])) {
            // add the class content WHILE preserving any other properties already in the tag!
            console.log("adding class content in: " + matcher[0]);

            var restOfTag = matcher[2];
            modifiedText = modifiedText.replace(matcher[0], `<${key} class="${classMap[key]}" ${restOfTag}>`);

            matcher = regex.exec(modifiedText);
        }
    });
    return modifiedText;
}

// handles adding classes to specific
// tag types automatically in project writeups
const projectsAddHeaderClass = {
    type: 'output', // when it's triggered -> output is at the very end when text is html
    filter: text => { return addClassToTag(text, projectClassMap); }
};

// create Showdown converters
const projectsConverter = new showdown.Converter({
    extensions: [projectsAddHeaderClass, showdownHighlight],
    tables: true
});

function convertMarkdownInDirWithShowdown(inputDir, outputDir, converter) {
    // make the directory for the html output if necessary
    mkdirp.sync(outputDir);
    fs.readdir(inputDir, (err, files) => {
        files.forEach(file => {
            if (file.endsWith('.md')) {
                let fileNameNoExtension = file.slice(0, -3);
                console.log('converting: ' + fileNameNoExtension);
                fs.readFile(inputDir + file, 'utf8', (err, data) => {
                    if (err) {
                        console.error(err);
                    } else {
                        let html = converter.makeHtml(data); // where the magic happens
                        fs.writeFile(outputDir + fileNameNoExtension + '.ejs', html, 'utf8', (err) => {
                            if (err) {
                                console.error(err);
                            }
                        });
                    }
                });
            }
        });
    });
}

function convertRecipeMarkdown(inputDir) {
    fs.readdir(inputDir, (err, files) => {
        files.forEach(file => {
            recipeTools.generateRecipePartials(file);
        });
    });
}

convertMarkdownInDirWithShowdown(projectInputDir, projectOutputDir, projectsConverter);
convertRecipeMarkdown("./recipes");
recipeTools.generateRecipeNavPartials();
