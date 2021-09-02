const Worker = require("./worker");

class Limiter {
  workers = [];

  /**
   * @param {number} limit
   * @param {number} waitingDurationMs
   */
  constructor(limit, waitingDurationMs = 300) {
    limit = +limit;

    this.limit = limit > 1 ? limit : 1;
    this.pauseDuration = waitingDurationMs;
    this.startWorkers();
  }

  startWorkers() {
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
    const freeWorker = this.workers.find((worker) => worker && worker.free);

    if (freeWorker) {
      return freeWorker.process(task);
    }

    return this.wait(task);
  }

  /**
   * @param {function} task
   * @returns {Promise<*>}
   */
  async wait(task) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), this.pauseDuration);
    }).then(() => this.process(task));
  }
}

module.exports = Limiter;
