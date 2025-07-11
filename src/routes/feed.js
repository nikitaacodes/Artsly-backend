const express = require("express");
const feedRouter = express.Router();
const Post = require("../models/posts");
const { userAuth } = require("../middleware/auth");

feedRouter.get("/", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const posts = await Post.find({ likes: { $ne: userId } })
      .populate("user", "userName profilePic")
      .sort({ createdAt: -1 })
      .limit(40);
    res.send(posts);
  } catch (err) {
    res.status(500).send("error :" + err.message);
  }
});


module.exports = feedRouter;
