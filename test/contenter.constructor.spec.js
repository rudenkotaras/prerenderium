const Contenter = require("./../lib/contenter");
const KeyValue = require("keyv");
const { default: KeyValueFile } = require("keyv-file");

describe("Contenter.constructor", () => {
  test("should have null cache", async () => {
    const contenter = new Contenter(1, false);
    expect(contenter.cache.store).toBeNull();
  });

  test("should have memory cache", async () => {
    const contenter = new Contenter(1, "memory");
    expect(contenter.cache.store).toBeInstanceOf(KeyValue);
    expect(contenter.cache.store.opts.store).toBeInstanceOf(Map);
  });

  test("should have file cache", async () => {
    const contenter = new Contenter(1, __filename);
    expect(contenter.cache.store).toBeInstanceOf(KeyValue);
    expect(contenter.cache.store.opts.store).toBeInstanceOf(KeyValueFile);
    expect(contenter.cache.store.opts.store._opts.filename).toBe(__filename);
  });

  test("should have environment cache", async () => {
    const contenter = new Contenter(1);
    expect(contenter.cache.store).toBeInstanceOf(KeyValue);
    expect(contenter.cache.store.opts.store).toBeInstanceOf(Map);
  });

  test("should have 1 worker", async () => {
    const contenter = new Contenter(1);
    expect(contenter.limiter.pool.min).toBe(1);
    expect(contenter.limiter.pool.max).toBe(1);
  });

  test("should have min 1 worker anyway", async () => {
    const contenter = new Contenter(0);
    expect(contenter.limiter.pool.min).toBe(1);
    expect(contenter.limiter.pool.max).toBe(1);
  });

  test("should have min 1 worker anyway", async () => {
    const contenter = new Contenter(undefined);
    expect(contenter.limiter.pool.min).toBe(1);
    expect(contenter.limiter.pool.max).toBe(1);
  });

  test("should have 3 workers", async () => {
    const contenter = new Contenter(3);
    expect(contenter.limiter.pool.min).toBe(1);
    expect(contenter.limiter.pool.max).toBe(3);
  });
});
