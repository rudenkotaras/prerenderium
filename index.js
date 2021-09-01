const app = require("./lib/app");

app.listen(3000);

process.on("unhandledRejection", (reason, p) => {
  stopBrowser();
  console.error("Unhandled Rejection at:", p, "reason:", reason);
  process.exit(1);
});

process.on("SIGINT", function () {
  stopBrowser();
  setTimeout(() => {
    process.exit(1);
  }, 500);
});

function stopBrowser() {
  try {
    (async () => app.context.renderer.getBrowser().close())();
  } catch (e) {
    console.error("Problem with browser stopping...");
  }
}
