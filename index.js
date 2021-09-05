require("dotenv").config();

const app = require("./lib/app")(process.env.WORKERS || 1);

app.listen(process.env.PORT || 3000);
