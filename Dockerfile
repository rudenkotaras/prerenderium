FROM node:14-alpine3.14 as builder

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=prod

FROM node:14-alpine3.14

ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/
ENV MEMORY_CACHE=0

RUN apk add --update-cache chromium=91.0.4472.164-r0
RUN rm -rf /var/cache/apk/* /tmp/*

EXPOSE 3000

WORKDIR /app

COPY --from=builder /app /app
COPY . /app

CMD ["node", "index.js"]
