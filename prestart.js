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
    recipeInputDir = './recipes/',
    recipeOutputDir = './views/partials/md/recipes/',
    projectClassMap = {
        h1: 'display-1' //tag type : class to add to all tags of that type (class="display-1" added to all <h1>)
    };
const { assert } = require('console');


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

function convertRecipeMarkdown(inputDir, outputDir) {
    var md = require('markdown-it')()
        .use(require('markdown-it-hashtag'));

    md.renderer.rules.hashtag_open = function (tokens, idx) {
        var tagName = tokens[idx].content.toLowerCase();
        return '<a href="/tags/' + tagName + '"><span class="badge bg-secondary">';
    }

    md.renderer.rules.hashtag_close = function () { return '</span></a>'; }

    // This is a hardcoded markdown header section number to html file name
    //
    // Example.md:
    // """
    // ... maybe some other header info here   -| - exported as filename-title.ejs
    // # Delicious Recipe Name                 -|
    // Catch phrase or yield        -|
    //                               | - exported as filename-subtitle
    // image of the food             |
    //                              -|
    // ## Ingredients              -|
    //  ... ingredients table, etc  | - exported as filename-ingredients.ejs
    //                             -|
    // ## Instructions
    // """
    //
    // NOTE: these titles are HARDCODED in recipe_template.ejs!
    const mdSectionHtmlTitles = [
        'title',
        // 'subtitle',
        'ingredients',
        'instructions',
    ]

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
                        let tokens = md.parse(data)

                        let sections = []
                        sections.push([]); // start off the array and put everything before and including the first header in title
                        let numSections = 0;
                        for (const token of tokens) {
                            if (token.type === 'heading_open') {
                                if (numSections == 0) {
                                    numSections++;
                                }
                                else if (numSections < mdSectionHtmlTitles.length) {
                                    console.log("found heading open. start new section arr");
                                    numSections++;
                                    sections.push([]);
                                }
                            }
                            sections[sections.length - 1].push(token)
                        }

                        assert(sections.length <= mdSectionHtmlTitles.length);

                        // hardcode bootstrap class attribute to add to <table> tag in ingredients
                        for (let ii = 0; ii < sections[1].length; ii++) {
                            if (sections[1][ii].type == 'table_open') {
                                sections[1][ii].attrs = [["class", "table table-striped table-sm table-hover"]];
                                break;
                            }
                        }
                        // console.log(sections[0]);

                        for (let ii = 0; ii < sections.length; ii++) {
                            let html = md.renderer.render(sections[ii], md.options);
                            // hardcode making images in the title section larger
                            if (ii == 0) {
                                var regex = new RegExp(`<img (.*?)>`, `g`);
                                matcher = regex.exec(html);
                                while (matcher != null && !matcher[1].includes("w-100")) {
                                    var restOfTag = matcher[1];
                                    html = html.replace(matcher[0], `<img class="w-100" ${restOfTag}>`);
                                    matcher = regex.exec(html);
                                }
                            }
                            fs.writeFileSync(outputDir + fileNameNoExtension + '-' + mdSectionHtmlTitles[ii] + '.ejs', html, 'utf8');
                        }
                    }
                });
            }
        });
    });
}

convertMarkdownInDirWithShowdown(projectInputDir, projectOutputDir, projectsConverter);
convertRecipeMarkdown(recipeInputDir, recipeOutputDir);
