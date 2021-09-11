const Koa = require("koa");
const Router = require("@koa/router");
const compress = require("koa-compress");
const Contenter = require("./contenter");

const REQUEST_PATTERN = "/:url(.*)";

/**
 * @param {Number} workers
 * @returns {Application}
 */
function init(workers = 1) {
  const app = new Koa();
  const router = new Router();

  const contenter = new Contenter(workers);

  router.get(REQUEST_PATTERN, async (ctx) => {
    const options = {
      headers: ctx.headers,
    };
    const output = await contenter.render(parseUrlString(ctx), options);
    if (Array.isArray(output)) {
      ctx.status = output[0];
      return;
    }
    ctx.body = output;
  });

  router.del(REQUEST_PATTERN, async (ctx) => {
    const output = await contenter.forget(parseUrlString(ctx));
    ctx.status = output[0];
  });

  app.use(compress());
  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}

/**
 * @param {Object} ctx
 * @returns {string}
 */
function parseUrlString(ctx) {
  let urlString = ctx.params.url;
  if (ctx.querystring) {
    urlString += `?${ctx.querystring}`;
  }
  return urlString;
}

module.exports = init;
