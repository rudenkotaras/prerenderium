const Contenter = require("./../lib/contenter");
const Content = require("./../lib/content");

const GOOGLE = "https://google.com/";

const CACHED_CONTENT = "cached content";
const ORIGINAL_CONTENT = "original content";

describe("Contenter.get()", () => {
  test("it should skip the cache:get(url, {}, false)", async () => {
    const contenter = new Contenter(1);

    await contenter.cache.set(GOOGLE, CACHED_CONTENT);

    contenter.limiter.process = jest.fn(() =>
      Promise.resolve(ORIGINAL_CONTENT)
    );

    const result = await contenter.get(GOOGLE, null, false);

    expect(result).toBeInstanceOf(Content);
    expect(result.status).toBe(200);
    expect(result.content).not.toBe(CACHED_CONTENT);
    expect(result.content).toBe(ORIGINAL_CONTENT);
  });

  test("it should skip the cache:getWithoutCache(url, {})", async () => {
    const contenter = new Contenter(1);

    await contenter.cache.set(GOOGLE, CACHED_CONTENT);

    contenter.limiter.process = jest.fn(() =>
      Promise.resolve(ORIGINAL_CONTENT)
    );

    const result = await contenter.getWithoutCache(GOOGLE, {});

    expect(result).toBeInstanceOf(Content);
    expect(result.status).toBe(200);
    expect(result.content).not.toBe(CACHED_CONTENT);
    expect(result.content).toBe(ORIGINAL_CONTENT);
  });

  test("it should put to the cache:get(url)", async () => {
    const contenter = new Contenter(1);

    contenter.limiter.process = jest.fn(() =>
      Promise.resolve(ORIGINAL_CONTENT)
    );

    const result = await contenter.get(GOOGLE);

    expect(result).toBeInstanceOf(Content);
    expect(result.status).toBe(200);
    expect(result.content).toBe(ORIGINAL_CONTENT);

    expect(await contenter.cache.get(GOOGLE)).toBe(ORIGINAL_CONTENT);
  });

  test("it should pass options:get(url, {...})", async () => {
    const contenter = new Contenter(1);
    const headers = { "user-agent": "curl/client" };

    contenter.limiter.process = jest
      .spyOn(contenter.limiter, "process")
      .mockImplementation(() => Promise.resolve());

    contenter.makeRenderPageTask = jest.spyOn(contenter, "makeRenderPageTask");

    await contenter.get(GOOGLE, { headers });

    expect(contenter.makeRenderPageTask).toHaveBeenCalledWith(GOOGLE, {
      headers,
    });
  });
});
