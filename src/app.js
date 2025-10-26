const express = require("express");
const connectDB = require("./config/database");
const app = express();

const cors = require("cors");

const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
require("dotenv").config();
//models
const User = require("../src/models/user");

//routes
const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const commentRouter = require("./routes/comment");
const feedRouter = require("./routes/feed");
const reqRouter = require("./routes/request");
const storyRouter = require("./routes/story");
const { userAuth } = require("./middleware/auth");
app.use("/", authRouter);
app.use("/", postRouter);
app.use("/comments", commentRouter);
app.use("/feed", feedRouter);
app.use("/request", reqRouter);
app.use("/story", storyRouter);
app.use("/uploads", express.static("uploads"));
//get user

app.get("/user", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      name: user.name,
      userName: user.userName,
      emailId: user.emailId,
      age: user.age,
      gender: user.gender,
      about: user.about,
      profilePic: user.profilePic,
    });
  } catch (err) {
    res.status(400).send("something went wrong" + err.message);
  }
});

//delete user
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

// update user info
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
      throw new Error("updates not allowed");
    }
    if (data?.about?.length > 100) {
      throw new Error("too long");
    }

    const user = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: "after",
      runValidators: true,
    });

    res.json({ message: "User updated successfully", user }); // ✅ return JSON
  } catch (err) {
    res
      .status(400)
      .json({ message: "something went wrong", error: err.message });
  }
});

//Database
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
