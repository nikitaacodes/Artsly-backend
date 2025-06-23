const express = require("express");
const connectDB = require("./config/database");

const app = express();
app.use(express.json());

connectDB()
  .then(() => {
    console.log("database connection established");
    app.listen(7777, () => {
      console.log("server is running");
    });
  })
  .catch((err) => {
    console.error("db cannot be connected");
  });
