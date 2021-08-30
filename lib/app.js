const Koa = require('koa');
const Router = require('@koa/router');
const Renderer = require('./renderer');
const cache = require('./cache');

const app = new Koa();
const router = new Router();

const renderer = new Renderer(cache);
(async () => await renderer.init())();

app.context.renderer = renderer;

router.get('/:url(.*)?', async (ctx) => ctx.body = await renderer.scrape(ctx.params.url || ''));
router.del('/:key(.*)?', async (ctx) => {
  await app.context.renderer.clearCache(ctx.params.key || '');
  ctx.status = 202;
});

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
