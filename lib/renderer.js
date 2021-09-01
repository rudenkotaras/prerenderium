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

    let text = await this.limiter.add(async () => {
      const browser = this.getBrowser();

      const page = await browser.newPage();

      let text = "";
      try {
        await page.goto(url, {
          waitUntil: "domcontentloaded",
        });

        text = await page.content();
      } catch (e) {}

      await page.close();

      return text;
    });

    if (text) {
      await this.cache.set(url, text);
    }

    return text;
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
