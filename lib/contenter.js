const debug = require("debug")("contenter:engine");
const Limiter = require("./limiter");
const { cacheFactory, EnvironmentCache } = require("./cache");
const Content = require("./content");
const filterHeaders = require("./utils/filter-headers");

const USER_AGENT_HEADER = "user-agent";

/**
 * @typedef {{
 *   headers: Object.<string, string>,
 *   gotoWaitUntil: "load"|"domcontentloaded"|"networkidle0"|"networkidle2",
 *   gotoTimeout: number
 * }} RenderPageOptions
 */

/**
 * @type {RenderPageOptions}
 */
const DefaultRenderPageOptions = {
  headers: {},
  gotoWaitUntil: "load",
  gotoTimeout: 30000,
};

class Contenter {
  /**
   * @param {number} workers
   * @param {Object|false|string} cache
   */
  constructor(workers, cache = null) {
    this.limiter = new Limiter(workers);

    if (cache && typeof cache === "object") {
      this.cache = cache;
    } else if (typeof cache === "boolean" || typeof cache === "string") {
      this.cache = cacheFactory(cache);
    } else {
      this.cache = EnvironmentCache();
    }
  }

  /**
   * @param {string} url
   * @param {Object} options
   * @param {Boolean} noCache
   * @returns {Promise<Content>}
   */
  async get(url = "", options = {}, noCache = false) {
    url = this.normalizeUrl(url);

    if (!url) {
      return new Content(400);
    }

    let content;

    try {
      if (!noCache) {
        content = await this.cache.get(url);
      }

      if (content) {
        return new Content(200, content);
      }

      content = await this.limiter.process(
        this.makeRenderPageTask(url, options)
      );

      if (content && !noCache) {
        await this.cache.set(url, content);
      }

      return new Content(200, content);
    } catch (e) {
      debug(`error during rendering ${url}`);
    }

    return new Content(400);
  }

  /**
   * @param {string} url
   * @param {Object} options
   * @returns {Promise<Content>}
   */
  async getWithoutCache(url, options) {
    return this.get(url, options, true);
  }

  /**
   * @param {string} url
   * @returns {Promise<Content>}
   */
  async forget(url) {
    if ("*" === url) {
      await this.cache.clear();
    } else {
      await this.cache.delete(this.normalizeUrl(url));
    }

    return new Content(202);
  }

  /**
   * @param {string} url
   * @param {RenderPageOptions} options
   * @returns {function}
   */
  makeRenderPageTask(url, options) {
    options = Object.assign({}, DefaultRenderPageOptions, options);

    return async (page) => {
      debug(`processing ${url}`);

      if (options.headers && options.headers[USER_AGENT_HEADER]) {
        await page.setUserAgent(options.headers[USER_AGENT_HEADER]);
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
