FROM node:8

RUN apt-get update -qq
RUN apt-get install -y emacs


# Create app directory
WORKDIR /iD

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
COPY . .
EXPOSE 8080

RUN npm run all

CMD [ "npm", "start" ]
