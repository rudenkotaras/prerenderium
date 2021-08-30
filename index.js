const app = require('./lib/app');

app.listen(3000);

process.on('unhandledRejection', (reason, p) => {
  try {
    (async () => app.context.renderer.getBrowser().close())();
  } catch (e) {
    console.error('Problem with browser stopping...');
  }
  console.error('Unhandled Rejection at:', p, 'reason:', reason)
  process.exit(1)
});
