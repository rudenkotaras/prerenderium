const puppeteer = require("puppeteer");
const url = require("url");
const isUrl = require("./is-url");

class Renderer {
  constructor(limiter, cache) {
    this.limiter = limiter;
    this.cache = cache;
  }

  async init() {
    this.browser = await this.initBrowser();
  }

  normalizeUrl = (u) => url.format(url.parse(u, true));

  async scrape(url = "") {
    url = this.normalizeUrl(url);

    if (!url || !isUrl(url)) {
      return [204];
    }

    const cached = await this.cache.get(url);
    if (cached) {
      return cached;
    }

    let text = await this.limiter.add(this.makeTaskFunction(url));

    if (text) {
      await this.cache.set(url, text);
    }

    return text;
  }

  /**
   * @param {string} url
   * @returns {function}
   */
  makeTaskFunction(url) {
    return async () => {
      const browser = this.getBrowser();

      const page = await browser.newPage();

      let text = "";
      try {
        const gotoConfiguration = {
          waitUntil: "networkidle0",
          timeout: 30000,
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
      } catch (e) {}

      await page.close();

      return text;
    };
  }

  async withBrowser(fn) {
    const browser = await puppeteer.launch({});
    try {
      return await fn(browser);
    } finally {
      await browser.close();
    }
  }

  async withPage(browser) {
    return async (fn) => {
      const page = await browser.newPage();
      try {
        return await fn(page);
      } finally {
        await page.close();
      }
    };
  }

  getBrowser() {
    return this.browser;
  }

  getCache() {
    return this.cache;
  }

  async clearCache(url) {
    if (url === "*") {
      await this.getCache().clear();
      return [202];
    }

    url = this.normalizeUrl(url);

    if (url && isUrl(url)) {
      await this.getCache().delete(url);
      return [202];
    }

    return [204];
  }

  async initBrowser() {
    return puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
      ],
      ignoreHTTPSErrors: true,
    });
  }
}

module.exports = Renderer;
