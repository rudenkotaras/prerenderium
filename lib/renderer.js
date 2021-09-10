const debug = require("debug")("prerenderium:renderer");

class Renderer {
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
   * @returns {Promise<string|number[]>}
   */
  async scrape(url = "") {
    url = this.normalizeUrl(url);

    if (!url) {
      return [204];
    }

    try {
      let content = await this.cache.get(url);

      if (content) {
        return content;
      }

      content = await this.limiter.process(this.makeTask(url));

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
   * @param {"load"|"domcontentloaded"|"networkidle0"|"networkidle2"} waitUntil
   * @param {number} timeout
   * @returns {function}
   */
  makeTask(url, waitUntil = "load", timeout = 30000) {
    return async (page) => {
      debug(`processing ${url}`);
      await page.goto(url, {
        waitUntil: waitUntil,
        timeout: timeout,
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
