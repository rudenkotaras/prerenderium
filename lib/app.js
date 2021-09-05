const Koa = require("koa");
const Router = require("@koa/router");
const compress = require("koa-compress");
const Renderer = require("./renderer");
const cache = require("./cache");
const Limiter = require("./limiter");

const REQUEST_PATTERN = "/:url(.*)?";

/**
 * @param {Number} workers
 * @returns {Application}
 */
function init(workers = 1) {
  const app = new Koa();
  const router = new Router();

  const renderer = new Renderer(new Limiter(workers), cache);
  app.context.renderer = renderer;

  router.get(REQUEST_PATTERN, async (ctx) => {
    const output = await renderer.scrape(ctx.params.url);
    if (Array.isArray(output)) {
      ctx.status = output[0];
      return;
    }
    ctx.body = output;
  });

  router.del(REQUEST_PATTERN, async (ctx) => {
    const output = await renderer.forget(ctx.params.url);
    ctx.status = output[0];
  });

  app.use(compress());
  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}

module.exports = init;
