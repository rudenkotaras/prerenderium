const url = require("url");
const isUrl = require("./is-url");

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
    return url.format(url.parse(urlString, true));
  }

  /**
   * @param {string} url
   * @returns {Promise<string|number[]>}
   */
  async scrape(url = "") {
    url = this.normalizeUrl(url);

    if (!url || !isUrl(url)) {
      return [204];
    }

    try {
      const cached = await this.cache.get(url);
      if (cached) {
        return cached;
      }

      let text = await this.limiter.add(this.makeTaskFunction(url));

      if (text) {
        await this.cache.set(url, text);
      }

      return text;
    } catch (e) {
      console.warn(e);
    }

    return "";
  }

  /**
   * @param {string} url
   * @param {"load"|"domcontentloaded"|"networkidle0"|"networkidle2"} waitUntil
   * @param {number} timeout
   * @returns {function}
   */
  makeTaskFunction(url, waitUntil = "networkidle0", timeout = 30000) {
    return async (browser) => {
      let text = "";

      try {
        const page = await browser.newPage();

        const gotoConfiguration = {
          waitUntil: waitUntil,
          timeout: timeout,
        };

        await page.goto(url, gotoConfiguration);

        page.on("request", (req) => {
          const allowedResources = ["document", "script", "xhr", "fetch"];
          if (!allowedResources.includes(req.resourceType())) {
            return req.abort();
          }
          req.continue();
        });

        text = await page.content();

        await page.close();
      } catch (e) {
        console.warn(e);
      }

      return text;
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

    if (url && isUrl(url)) {
      await this.cache.delete(url);
      return [202];
    }

    return [204];
  }
}

module.exports = Renderer;
