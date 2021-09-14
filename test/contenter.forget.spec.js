const Contenter = require("./../lib/contenter");
const Content = require("./../lib/content");

const GOOGLE = "https://google.com/";
const FACEBOOK = "https://facebook.com/";

const CACHED_CONTENT = "cached content";

describe("contenter.forget()", () => {
  test("it should forget the cache:forget(url))", async () => {
    const contenter = new Contenter(1);

    await contenter.cache.set(GOOGLE, CACHED_CONTENT);

    const result = await contenter.forget(GOOGLE);

    expect(result).toBeInstanceOf(Content);
    expect(result.status).toBe(202);
    expect(result.content).toBe("");
    expect(await contenter.cache.get(GOOGLE)).toBeUndefined();
  });

  test("it should forget all the cache:forget(*))", async () => {
    const contenter = new Contenter(1);

    await contenter.cache.set(GOOGLE, CACHED_CONTENT);
    await contenter.cache.set(FACEBOOK, CACHED_CONTENT);

    const result = await contenter.forget("*");

    expect(result).toBeInstanceOf(Content);
    expect(result.status).toBe(202);
    expect(result.content).toBe("");
    expect(await contenter.cache.get(GOOGLE)).toBeUndefined();
    expect(await contenter.cache.get(FACEBOOK)).toBeUndefined();
  });

  test("it should work with empty cache:forget(url))", async () => {
    const contenter = new Contenter(1);

    const result = await contenter.forget(GOOGLE);

    expect(result).toBeInstanceOf(Content);
    expect(result.status).toBe(202);
    expect(result.content).toBe("");
  });
});
