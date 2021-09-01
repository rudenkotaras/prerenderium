const Worker = require("./worker");

class Limiter {
  workers = [];

  /**
   * @param {number} limit
   * @param {number} pauseTimeout
   */
  constructor(limit, pauseTimeout = 30) {
    limit = +limit;

    this.limit = limit > 1 ? limit : 1;
    this.pauseTimeout = pauseTimeout;
    this.start();
  }

  start() {
    for (let i = 0; i < this.limit; i++) {
      this.workers.push(new Worker());
    }
  }

  /**
   * @param {function} task
   * @returns {Promise<*>}
   */
  async add(task) {
    return this.process(task);
  }

  /**
   * @param {function} task
   * @returns {Promise<*>}
   */
  async process(task) {
    let freeWorker = this.workers.find((worker) => worker && worker.free);

    if (freeWorker) {
      return freeWorker.process(task);
    }

    return this.pause(task);
  }

  /**
   * @param {function} task
   * @returns {Promise<*>}
   */
  async pause(task) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), this.pauseTimeout);
    }).then(() => this.process(task));
  }
}

module.exports = Limiter;
