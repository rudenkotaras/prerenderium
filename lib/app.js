const Koa = require("koa");
const Router = require("@koa/router");
const Renderer = require("./renderer");
const cache = require("./cache");
const Limiter = require("./limiter");

const app = new Koa();
const router = new Router();

const renderer = new Renderer(new Limiter(1), cache);
(async () => await renderer.init())();

router.get("/:url(.*)?", async (ctx) => {
  const output = await renderer.scrape(ctx.params.url);
  if (Array.isArray(output)) {
    ctx.status = output[0];
    return;
  }
  ctx.body = output;
});

router.del("/:url(.*)?", async (ctx) => {
  const output = await renderer.clearCache(ctx.params.url);
  ctx.status = output[0];
});

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
