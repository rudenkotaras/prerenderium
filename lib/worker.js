class Worker {
  free = true;

  /**
   * @param {function} task
   * @returns {Promise<*>}
   */
  async process(task) {
    this.free = false;

    return await task().then((result) => {
      this.free = true;

      return result;
    });
  }
}

module.exports = Worker;
