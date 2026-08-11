require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { limiter } = require("./middleware/rateLimiter");
const { userAuth } = require("./middleware/auth");
const upload = require("./middleware/upload");

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(limiter);

const User = require("./models/user");

const authRouter = require("./routes/auth");
const postRouter = require("./routes/post");
const commentRouter = require("./routes/comment");
const feedRouter = require("./routes/feed");
const reqRouter = require("./routes/request");
const storyRouter = require("./routes/story");

app.use("/", authRouter);
app.use("/", postRouter);
app.use("/comments", commentRouter);
app.use("/feed", feedRouter);
app.use("/request", reqRouter);
app.use("/story", storyRouter);

app.get("/user", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      _id: user._id,
      name: user.name,
      userName: user.userName,
      emailId: user.emailId,
      age: user.age,
      gender: user.gender,
      about: user.about,
      profilePic: user.profilePic,
      role: user.role,
      followers: user.followers.length,
      following: user.following.length,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/user/:userId", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("followers", "userName profilePic")
      .populate("following", "userName profilePic");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      userName: user.userName,
      about: user.about,
      profilePic: user.profilePic,
      followers: user.followers,
      following: user.following,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/user/:userId/follow", userAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const user = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!user || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.following.includes(userId)) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== userId,
      );
      user.followers = user.followers.filter(
        (id) => id.toString() !== currentUserId,
      );
      await currentUser.save();
      await user.save();
      return res.json({ message: "Unfollowed successfully" });
    }

    currentUser.following.push(userId);
    user.followers.push(currentUserId);
    await currentUser.save();
    await user.save();

    res.json({ message: "Followed successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/user/:id", userAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user._id.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch(
  "/user/:userId",
  userAuth,
  upload.single("profilePic"),
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const data = req.body;

      if (req.user._id.toString() !== userId && req.user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const ALLOWED_UPDATES = ["name", "age", "gender", "about"];

      const isUpdateAllowed = Object.keys(data).every((k) =>
        ALLOWED_UPDATES.includes(k),
      );
      if (!isUpdateAllowed) {
        return res.status(400).json({ message: "Updates not allowed" });
      }

      if (data?.about?.length > 500) {
        return res.status(400).json({ message: "About section is too long" });
      }

      const user = await User.findByIdAndUpdate({ _id: userId }, data, {
        new: true,
        runValidators: true,
      });

      res.json({ message: "User updated successfully", user });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
);

app.get("/health", (req, res) => {
  res.json({ message: "Server is running" });
});

connectDB()
  .then(() => {
    console.log("Database connection established");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
