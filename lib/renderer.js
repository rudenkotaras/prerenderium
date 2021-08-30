const puppeteer = require('puppeteer');
const isUrl = require('./is-url');

class Renderer {

  constructor(cache) {
    this.cache = cache;
  }

  async init() {
    this.browser = await this.initBrowser();
  }

  async scrape(url) {

    url = url.trim();

    if (!url || !isUrl(url)) {
      return '';
    }

    const cached = await this.cache.get(url);
    if (cached) {
      return cached
    }

    const browser = this.getBrowser();

    const page = await browser.newPage();

    let text = '';
    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
      });

      text = await page.content();
    } catch (e) {

    }

    await page.close();

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

  async clearCache(key) {
    if (key === '*') {
      await this.getCache().clear()
    }

    if (key) {
      await this.getCache().delete(key);
    }
  }

  async initBrowser() {
    return puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
      ignoreHTTPSErrors: true,
    })
  }
}

module.exports = Renderer;
