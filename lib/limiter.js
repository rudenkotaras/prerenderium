const debug = require("debug")("prerender:limiter");
const genericPool = require("generic-pool");

const initWorker = require("./worker").initWorker;

class Limiter {
  /**
   * @param {number} workers
   * @param {number} waitingDurationMs
   */
  constructor(workers, waitingDurationMs = 300) {
    workers = +workers;

    this.limit = Math.max(workers, 1);

    this.pool = genericPool.createPool(
      {
        create: () => initWorker(),
        destroy: () => Promise.resolve(),
      },
      {
        max: this.limit,
        min: 1,
        autostart: true,
      }
    );

    debug("limiter started");
  }

  /**
   * @param {function} task
   * @returns {Promise<*>}
   */
  async process(task) {
    return this.pool.acquire().then((worker) => {
      return worker.process(task).then((content) => {
        this.pool.release(worker);

        return content;
      });
    });
  }
}

module.exports = Limiter;
