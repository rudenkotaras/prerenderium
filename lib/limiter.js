const Worker = require("./worker");

class Limiter {
  instances = [];

  /**
   * @param {number} workers
   * @param {number} waitingDurationMs
   */
  constructor(workers, waitingDurationMs = 300) {
    workers = +workers;

    this.limit = Math.max(workers, 1);
    this.pauseDuration = waitingDurationMs;

    this.startWorkers().finally(() => {
      console.log("limiter started");
    });
  }

  async startWorkers() {
    for (let i = 0; i < this.limit; i++) {
      this.instances.push(await new Worker(i).init());
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
    const freeWorker = this.instances.find((worker) => worker && worker.free);

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
