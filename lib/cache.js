const debug = require("debug")("contenter:cache");
const KeyValue = require("keyv");
const KeyValueFile = require("keyv-file").KeyvFile;

class Cache {
  /**
   * @param {Object?} store
   */
  constructor(store) {
    this.store = store;
  }

  /**
   * @param {string} url
   * @returns {Promise<string>}
   */
  async get(url) {
    if (null === this.store) {
      return null;
    }

    return this.store.get(url).then((content) => {
      if (content) {
        debug(`hit found for ${url}`);
      }

      return content;
    });
  }

  /**
   * @param {string} url
   * @param {string} content
   * @returns {Promise<void>}
   */
  async set(url, content) {
    if (null === this.store) {
      return null;
    }

    return this.store.set(url, content).then(() => {
      debug(`stored ${url}`);
    });
  }

  /**
   * @returns {Promise<void>}
   */
  async clear() {
    if (null === this.store) {
      return null;
    }

    return this.store.clear();
  }

  /**
   * @param {string} url
   * @returns {Promise<void>}
   */
  async delete(url) {
    if (null === this.store) {
      return null;
    }

    return this.store.delete(url);
  }
}

/**
 * @returns {Cache}
 * @constructor
 */
const NullCache = () => new Cache(null);

/**
 * @returns {Cache}
 * @constructor
 */
const MemoryCache = () => new Cache(new KeyValue({}));

/**
 * @param {string} filePath
 * @returns {Cache}
 * @constructor
 */
const FileCache = (filePath) =>
  new Cache(new KeyValue({ store: new KeyValueFile({ filename: filePath }) }));

const detectStore = () => {
  if (+process.env.DISABLE_CACHE) {
    debug("is completely disabled");
    return null;
  }

  let config = {};

  if (process.env.CACHE_FILE) {
    config.store = new KeyValueFile({
      filename: process.env.CACHE_FILE,
    });
  }

  return new KeyValue(config);
};

module.exports = Cache;
module.exports.detectStore = detectStore;
module.exports.EnvironmentCache = () => new Cache(detectStore());
module.exports.NullCache = NullCache;
module.exports.MemoryCache = MemoryCache;
module.exports.FileCache = FileCache;
