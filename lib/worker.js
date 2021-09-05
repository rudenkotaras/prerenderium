const puppeteer = require("puppeteer");

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

    return await task(this.browser).then((result) => {
      this.free = true;

      return result;
    });
  }

  /**
   * @returns {Promise<Browser>}
   */
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

module.exports = Worker;
