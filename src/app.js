const express = require("express");
const connectDB = require("./config/database");
const app = express();
app.use(express.json());
const User = require("../src/models/user");
const authRouter = require("./routes/auth");
app.use("/", authRouter);

app.get("/user", async (req, res) => {
  try {
    const userEmail = req.body.emailId;
    const users = await User.find({
      emailId: userEmail,
    });
    if (users.length === 0) {
      res.status(400).send("user not found");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(400).send("something went wrong" + err.message);
  }
});
app.delete("/user/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).send("User not found");
    }

    res.status(200).send("User deleted successfully");
  } catch (err) {
    res.status(500).send("Error deleting user");
  }
});


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
