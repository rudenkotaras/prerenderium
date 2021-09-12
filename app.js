const Koa = require("koa");
const Router = require("@koa/router");
const compress = require("koa-compress");
const Contenter = require("./lib/contenter");

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
    const {status, content} = await contenter.get(parseUrlString(ctx), {headers: ctx.headers});
    ctx.status = status;
    ctx.body = content;
  });

  router.del(REQUEST_PATTERN, async (ctx) => {
    const {status} = await contenter.forget(parseUrlString(ctx));
    ctx.status = status;
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
