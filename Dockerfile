FROM node:14-alpine3.14

ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/
ENV MEMORY_CACHE=0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

RUN apk add --update-cache chromium
RUN rm -rf /var/cache/apk/* /tmp/*

EXPOSE 3000

COPY . /app

WORKDIR /app

RUN npm ci

CMD ["node", "index.js"]
