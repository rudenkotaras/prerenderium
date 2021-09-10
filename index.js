require("dotenv").config();

const PORT = process.env.PORT || 3000;
const app = require("./lib/app")(process.env.WORKERS || 1);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`prerenderium is listening on ${PORT} port`);
});
