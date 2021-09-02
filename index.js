const app = require("./lib/app");

app.listen(3000);

process.on("unhandledRejection", (reason, p) => {
  stopBrowser();
  console.error("Unhandled Rejection at:", p, "reason:", reason);
  setTimeoutAndExit();
});

process.on("SIGINT", function () {
  stopBrowser();
  setTimeoutAndExit();
});

function stopBrowser() {
  try {
    (async () => app.context.renderer.getBrowser().close())();
  } catch (e) {
    console.error("Problem with browser stopping...");
  }
}

function setTimeoutAndExit() {
  setTimeout(() => {
    process.exit(1);
  }, 500);
}
