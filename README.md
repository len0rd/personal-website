Its a website! Sphinx + ablog

## Run locally

1. From this directory install dependencies with `npm install`
2. Run the server with `npm start`

## Build the production docker image

`docker build -t leo_website:latest .`

## Run the production container

`docker run --rm -td -p 8888:8090 leo_website:prod --name leo_website`

## Colors of the rainbow

(just a quick refernce for the color swatch of the rainbow in the old main image)

\#F6E73C

\#F8BA4B

\#5AB2DA

\#F591AB

\#865897

\#06061D
