const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const routeManager = require('./routes/route.manager.js');
const { createsocket } = require("./socket/index.js");
const { createServer } = require("node:http");

require("dotenv").config();
// ============ Initilize the app ========================

const app = express();
app.use(express.json({limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true , limit: '50mb'}));

app.use(cors());

// const server = createServer(app);
// async function main() {
//   createsocket(server);
// }
// main();

// application routes
routeManager(app)

app.get("/", (req, res) => {
  res.send("Welcome to Wager backend server");
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).json({
      status: false,
      code  : 500,
      error : `Can't find ${err.stack}`
  });
});

// 404 handler
app.use(function (req, res, next) {
  res.status(404).json({
      status: false,
      code  : 404,
      error : `Can't find ${req.originalUrl}`
  });
});

require("./services/mongo/index.js")
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("Running on port " + PORT);
});