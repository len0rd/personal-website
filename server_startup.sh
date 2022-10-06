# build project documentation
sphinx-build project_writeups/ assets/projects -b html
# generate recipe ejs partials
node prestart.js
