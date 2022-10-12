FROM node:14-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

RUN apk add --no-cache python3 bash \
    && ln -sf python3 /usr/bin/python

# Bundle app source
COPY . .

RUN python3 -m ensurepip \
    && pip3 install --no-cache --upgrade pip setuptools \
    && pip3 install -r pip-requirements.txt

EXPOSE 8090

CMD [ "npm", "start" ]
