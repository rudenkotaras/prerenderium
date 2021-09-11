const debug = require("debug")("contenter:engine");
const Limiter = require("./limiter");
const Cache = require("./cache");
const filterHeaders = require("./utils/filter-headers");

/**
 * @typedef {{
 *   headers: Object.<string, string>,
 *   gotoWaitUntil: "load"|"domcontentloaded"|"networkidle0"|"networkidle2",
 *   gotoTimeout: number
 * }} TaskOptions
 */

/**
 * @type {TaskOptions}
 */
const DefaultTaskOptions = {
  headers: {},
  gotoWaitUntil: "load",
  gotoTimeout: 30000,
};

class Contenter {
  /**
   * @param {number} workers
   * @param {Object?} cache
   */
  constructor(workers, cache = null) {
    this.limiter = new Limiter(workers);
    if (null !== cache) {
      this.cache = cache;
    } else {
      this.cache = Cache.EnvironmentCache();
    }
  }

  /**
   * @param {string} url
   * @param {Object} options
   * @param {Boolean} skipCache
   * @returns {Promise<string|number[]>}
   */
  async render(url = "", options = {}, skipCache = false) {
    url = this.normalizeUrl(url);

    if (!url) {
      return [204];
    }

    try {
      let content;

      if (!skipCache) {
        content = await this.cache.get(url);
      }

      if (content) {
        return content;
      }

      try {
        content = await this.limiter.process(this.makeTask(url, options));
      } catch (e) {
        debug(`error during opening ${url}`);
        return null;
      }

      if (content && !skipCache) {
        await this.cache.set(url, content);
      }

      return content;
    } catch (e) {
      debug(e);
    }

    return "";
  }

  /**
   * @param {string} url
   * @param {TaskOptions} options
   * @returns {function}
   */
  makeTask(url, options) {
    options = Object.assign({}, DefaultTaskOptions, options);

    return async (page) => {
      debug(`processing ${url}`);

      if (options.headers && options.headers["user-agent"]) {
        await page.setUserAgent(options.headers["user-agent"]);
      }

      await page.setExtraHTTPHeaders(filterHeaders(options.headers));

      await page.goto(url, {
        waitUntil: options.gotoWaitUntil,
        timeout: options.gotoTimeout,
      });
      debug(`processed ${url}`);
    };
  }

  /**
   * @param {string} url
   * @returns {Promise<number[]>}
   */
  async forget(url) {
    if ("*" === url) {
      await this.cache.clear();
      return [202];
    }

    url = this.normalizeUrl(url);

    if (url) {
      await this.cache.delete(url);
      return [202];
    }

    return [204];
  }

  /**
   * @param {string} urlString
   * @returns {string}
   */
  normalizeUrl(urlString) {
    try {
      return new URL(urlString).toString();
    } catch (_) {
      return "";
    }
  }
}

module.exports = Contenter;
