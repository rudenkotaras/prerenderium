const puppeteer = require("puppeteer");
const uselessTypes = require("./interceptors/useless-types");
const uselessResources = require("./interceptors/useless-resources");
const uselessScripts = require("./interceptors/useless-scripts");

class Worker {
  free = true;

  constructor(workerPID) {
    this.workerPID = workerPID;
  }

  /**
   * @returns {self}
   */
  async init() {
    this.browser = await this.initBrowser();

    console.debug({
      browserPID: this.browser.process().pid,
      pid: this.workerPID,
    });

    return this;
  }

  /**
   * @param {function} task
   * @returns {Promise<*>}
   */
  async process(task) {
    this.free = false;

    let content = "";

    return new Promise(async (resolve) => {
      const page = await this.browser.newPage();

      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (uselessTypes(request) || uselessResources(request)) {
          return request.abort();
        }

        request.continue();
      });

      await task(page);

      content = uselessScripts(await page.content());

      await page.close();

      return resolve(content);
    })
      .catch((e) => {
        console.warn(e);

        return "";
      })
      .finally(() => {
        this.free = true;
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
    });
  }
}

module.exports = Worker;
