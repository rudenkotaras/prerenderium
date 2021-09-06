const KeyValue = require("keyv");
const KeyValueFile = require("keyv-file").KeyvFile;

let config = {};

if (process.env.CACHE_FILE) {
  config.store = new KeyValueFile({
    filename: process.env.CACHE_FILE,
  });
}

const cache = new KeyValue(config);

module.exports = cache;
