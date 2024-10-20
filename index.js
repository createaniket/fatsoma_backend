const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
var cors = require('cors')

require("dotenv").config();

const app = express();

const bodyParser = require("body-parser");

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

const port = process.env.PORT || 9000;

app.use("/Public", express.static(path.join(__dirname, "Public")));


// Connect to MongoDB
mongoose.connect(process.env.DBURL);

// Check connection status
const db = mongoose.connection;

db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
  process.exit(0);
});

db.once("open", () => {
  console.log("Connected to MongoDB");
});

db.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
});




setInterval(() => {
  console.log("I am just aliving the server")
}, 20000);

app.listen(port, () => {
  console.log(`port has been up at ${port}`);
});