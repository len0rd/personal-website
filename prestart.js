// convert our markdown documentation files
// to 'static' html/ejs partials:
// while this is a bit inconvenient (you need to restart
// the server everytime you want to see 
// md changes), it is more efficient in 
// that we aren't converting MD -> ejs
// on EVERY request
const showdown  = require('showdown'),
    fs        = require('fs'),
    mkdirp    = require('mkdirp'),
    inputDir  = './project_writeups/',
    outputDir = './views/partials/md/',
    classMap  = {
        h1: 'display-1'
    };

//handles adding classes to specific 
//tag types automatically
const addClass = {
    type: 'output',
    filter: text => {
        var modifiedText = text;
        Object.keys(classMap).forEach(function(key) {
            var regex = new RegExp(`<${key}(.*?)>`, 'g');
            matcher = regex.exec(modifiedText);

            while (matcher != null && !matcher[0].includes(classMap[key])) {
                console.log(matcher[0]);

                var restOfTag = matcher[1];
                modifiedText.replace(matcher[0], `<${key} class="${classMap[key]}" ${restOfTag}>`);

                matcher = regex.exec(modifiedText);
            }
        });
        return modifiedText;
    }
};

const converter = new showdown.Converter({
    extensions: [addClass]
});

mkdirp(outputDir, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.log('output dir created');
    }
});

fs.readdir(inputDir, (err, files) => {
    files.forEach(file => {
        if (file.endsWith('.md')) {
            let fileNameNoExtension = file.slice(0, -3);
            console.log('converting: ' + fileNameNoExtension);
            fs.readFile(inputDir + file, 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                } else {
                    let html = converter.makeHtml(data);
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
