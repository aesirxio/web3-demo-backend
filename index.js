#!/usr/bin/env node

require("dotenv-flow").config();

// Import expressinde
const express = require("express");
// Import Body parser
const bodyParser = require("body-parser");
// Import Mongoose
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
// Initialise the app
const app = express();

// Setup environment variables
const port = process.env.PORT || 3000;
const dbHost = process.env.DBHOST || "localhost";
const dbName = process.env.DBNAME || "aesirxweb3demo";

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
  .connect("mongodb://" + dbHost + "/" + dbName, {
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
