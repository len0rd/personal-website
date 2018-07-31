// convert our markdown documentation files
// to 'static' html/ejs partials:
// while this is a bit inconvenient (you need to restart
// the server everytime you want to see 
// md changes), it is more efficient in 
// that we aren't converting MD -> ejs
// on EVERY request
var showdown  = require('showdown'),
    converter = new showdown.Converter(),
    fs        = require('fs'),
    mkdirp    = require('mkdirp'),
    inputDir  = './md_writeup/',
    outputDir = './views/partials/md/';

mkdirp(outputDir, function(err){
    if (err) {
        console.error(err);
    } else {
        console.log('output dir created');
    }
})

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
