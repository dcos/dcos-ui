FROM alekzonder/puppeteer:1.8.0-0

WORKDIR /app

ADD package*.json ./
RUN npm install

ADD index.js ./

ENTRYPOINT ["node", "index.js"]
