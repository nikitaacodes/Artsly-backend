const express = require("express");
const connectDB = require("./config/database");
const app = express();

const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.json());
require("dotenv").config();
//models
const User = require("../src/models/user");

//routes
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const commentRouter = require("./routes/comment");

app.use("/", authRouter);
app.use("/", postRouter);
app.use("/comments", commentRouter);

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

app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;
  try {
    const ALLOWED_UPDATES = [
      "name",
      "userName",
      "age",
      "gender",
      "about",
      "profilePic",
    ];

    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (!isUpdateAllowed) {
      throw new Error("updteas not allowed");
    }
    if (data?.about > 100) {
      throw new Error("too long");
    }
    const user = await User.findByIdAndUpdate(
      {
        _id: userId,
      },
      data,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );
    console.log(user);
    res.send("user updated ");
  } catch (err) {
    res.status(400).send("something went wrong");
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
