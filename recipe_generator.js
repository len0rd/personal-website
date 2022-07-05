const fs = require('fs'),
    mkdirp = require('mkdirp'),
    recipeInputDir = './recipes/',
    recipeOutputDir = './views/partials/md/recipes/',
    recipeListGeneratedOutputDir = './views/partials/generated/';
const { assert } = require('console');

var mdIt = require('markdown-it')()
    .use(require('markdown-it-hashtag'));

mdIt.renderer.rules.hashtag_open = function (tokens, idx) {
    var tagName = tokens[idx].content.toLowerCase();
    return '<a href="/recipe_navigator?tag=' + tagName + '"><span class="badge bg-secondary">';
}
mdIt.renderer.rules.hashtag_close = function () { return '</span></a>'; }


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

/// @param: fileName: the markdown file to open
///     and generate into EJS partials
function generateRecipePartials(fileName) {
    mkdirp.sync(recipeOutputDir);
    if (!fileName.endsWith('.md')) {
        return;
    }
    let fileNameNoExtension = fileName.slice(0, -3);
    console.log('converting: ' + fileNameNoExtension);
    fs.readFile(recipeInputDir + fileName, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        var ingredientTableRegex = new RegExp(`^(\\|?.*?)\\|(.*?)(\\|.*?\\|.*?)\r?\n`, `m`);
        var ingredientDashCheck = new RegExp("^\-+$");
        ingredientTableMatcher = ingredientTableRegex.exec(data);
        while (ingredientTableMatcher != null) {
            meas = ingredientTableMatcher[1];
            let unit = ingredientTableMatcher[2].toLowerCase().trim();
            if (unit != "unit" && unit && !ingredientDashCheck.test(unit)) {
                meas += unit + " ";
            }
            data = data.replace(ingredientTableMatcher[0], `${meas}${ingredientTableMatcher[3]}\n`);
            ingredientTableMatcher = ingredientTableRegex.exec(data);
        }

        let tokens = mdIt.parse(data)

        let sections = []
        sections.push([]); // start off the array and put everything before and including the first header in title
        let numSections = 0;
        for (const token of tokens) {
            if (token.type === 'heading_open') {
                if (numSections == 0) {
                    numSections++;
                }
                else if (numSections < mdSectionHtmlTitles.length) {
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

        for (let ii = 0; ii < sections.length; ii++) {
            let html = mdIt.renderer.render(sections[ii], mdIt.options);
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
            fs.writeFileSync(recipeOutputDir + fileNameNoExtension + '-' + mdSectionHtmlTitles[ii] + '.ejs', html, 'utf8');
        }
    });
}

function generateRecipeNavPartials() {
    // generate a list of recipe links. While doing so generate an array
    // of unique hashtags found in all recipes
    mkdirp.sync(recipeListGeneratedOutputDir);
    let recipeListPartialOut = "";
    let allRecipeHashtags = [];
    fs.readdir(recipeInputDir, (err, files) => {
        files.sort().forEach(file => {
            if (!file.endsWith('.md')) {
                return;
            }
            let fileNameNoExtension = file.slice(0, -3);

            const data = fs.readFileSync(recipeInputDir + file, { encoding: 'utf8', flag: 'r' });

            // find all hashtags in the file
            var hashtagRegex = new RegExp(`#(\\w+)`, `g`);
            hashtagMatcher = hashtagRegex.exec(data);
            var recipeTags = []; // hashtags of the current recipe only
            while (hashtagMatcher != null) {
                var hashtag = hashtagMatcher[1].toLowerCase();
                if (!allRecipeHashtags.includes(hashtag)) {
                    allRecipeHashtags.push(hashtag);
                }
                if (!recipeTags.includes(hashtag)) {
                    recipeTags.push(hashtag);
                }
                hashtagMatcher = hashtagRegex.exec(data);
            }

            let combinedRecipeTags = "";
            if (recipeTags.length > 0) {
                combinedRecipeTags = recipeTags.join(",");
            }

            // get first recipe title from document
            var titleRegex = new RegExp(`#\\s+(.+)\\n`, `g`);
            titleMatcher = titleRegex.exec(data);
            var recipeTitle = fileNameNoExtension;
            if (titleMatcher != null) {
                recipeTitle = titleMatcher[1];
            }

            recipeListPartialOut += `<a href="recipes/${fileNameNoExtension}" class="list-group-item list-group-item-action" tags="${combinedRecipeTags}">${recipeTitle}</a>\n`;
        });

        // writeout the link list partial
        fs.writeFileSync(recipeListGeneratedOutputDir + "recipe-links.ejs", recipeListPartialOut, "utf-8");

        // now generate the  hashtag button list partial
        // TODO: in the future sort the list by number of hashtag hits (most -> least common)
        //      instead of alphabetically
        let tagListPartialOut = "";
        allRecipeHashtags.sort().forEach(hashtag => {
            tagListPartialOut += `<button type="button" class="btn btn-light btn-sm">${hashtag}</button>\n`;
        });
        fs.writeFileSync(recipeListGeneratedOutputDir + "recipe-tags.ejs", tagListPartialOut, "utf-8");
    });
}

module.exports = {
    generateRecipePartials: generateRecipePartials,
    generateRecipeNavPartials: generateRecipeNavPartials,
}
