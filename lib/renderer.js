const debug = require("debug")("prerenderium:renderer");
const filterHeaders = require("./utils/filter-headers");

/**
 * @typedef {{
 *   headers: Object.<string, string>,
 *   gotoWaitUntil: "load"|"domcontentloaded"|"networkidle0"|"networkidle2",
 *   gotoTimeout: number
 * }} TaskOptions
 */

const DefaultTaskOptions = {
  headers: {},
  gotoWaitUntil: "load",
  gotoTimeout: 30000,
};

class Renderer {
  /**
   * @param {Object} limiter
   * @param {Object} cache
   */
  constructor(limiter, cache) {
    this.limiter = limiter;
    this.cache = cache;
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

  /**
   * @param {string} url
   * @param {Object} options
   * @returns {Promise<string|number[]>}
   */
  async scrape(url = "", options = {}) {
    url = this.normalizeUrl(url);

    if (!url) {
      return [204];
    }

    try {
      let content = await this.cache.get(url);

      if (content) {
        return content;
      }

      try {
        content = await this.limiter.process(this.makeTask(url, options));
      } catch (e) {
        debug(`error during opening ${url}`);
        return null;
      }

      if (content) {
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
}

module.exports = Renderer;
