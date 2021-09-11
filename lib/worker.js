const debug = require("debug")("contenter:worker");
const puppeteer = require("puppeteer");
const uselessTypes = require("./interceptors/useless-types");
const uselessResources = require("./interceptors/useless-resources");
const uselessScripts = require("./interceptors/useless-scripts");

class Worker {
  /**
   * @returns {Promise<Worker>}
   */
  static initWorker() {
    return new Worker().init();
  }

  /**
   * @returns {Promise<Worker>}
   */
  async init() {
    this.browser = await this.initBrowser();

    debug({
      version: await this.browser.version(),
      pid: this.browser.process().pid,
    });

    return this;
  }

  /**
   * @param {function} task
   * @returns {Promise<*>}
   */
  async process(task) {
    let content = "";

    let page = null;

    return new Promise(async (resolve, reject) => {
      page = await this.browser.newPage();

      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (uselessTypes(request) || uselessResources(request)) {
          return request.abort();
        }

        request.continue();
      });

      try {
        await task(page);

        content = uselessScripts(await page.content());
      } catch (e) {
        return reject(e);
      }

      return resolve(content);
    })
      .catch((e) => {
        debug(e.message);

        return Promise.reject(e.message);
      })
      .finally(async () => {
        await page.close();
      });
  }

  /**
   * @returns {Promise<Browser>}
   */
  async initBrowser() {
    return puppeteer.launch({
      args: [
        "--no-sandbox",
        "--headless",
        "--disable-gpu",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--allow-insecure-localhost",
      ],
      ignoreHTTPSErrors: true,
      executablePath: process.env.CHROME_BIN || null,
    });
  }
}

module.exports = Worker;
