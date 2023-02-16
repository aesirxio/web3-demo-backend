#!/usr/bin/env node
require("dotenv-flow").config();

const cors = require("cors");

// Import expressinde
const express = require("express");
// Import Body parser
const bodyParser = require("body-parser");
// Import Mongoose
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
// Initialise the app
const app = express();

app.use(
  cors({
    origin: "*",
  })
);

// Setup environment variables
const port = process.env.PORT || 3000;
const dbUser = process.env.DBUSER || "aesirxweb3";
const dbPass = process.env.DBPASS || "demo";
const dbHost = process.env.DBHOST || "localhost";
const dbName = process.env.DBNAME || "aesirxweb3";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Import routes
const apiRoutes = require("./api-routes");
// Configure bodyparser to handle post requests
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
// Connect to Mongoose and set connection variable
mongoose
  .connect("mongodb://" + dbUser + ":" + dbPass + "@" + dbHost + "/" + dbName + "?authSource=admin", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch(function (err) {
    console.log("DB connection failed");
    process.exit(1);
  });

// Send message for default URL
app.get("/", (req, res) => res.status(404).end());

// Use Api routes in the App
app.use("/", apiRoutes);
// Launch app to listen to specified port
app.listen(port, function () {
  console.log("Running web3 backend API on port " + port);
});
