const express = require("express");
const feedRouter = express.Router();
const Post = require("../models/posts");
const { userAuth } = require("../middleware/auth");

feedRouter.get("/", userAuth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "userName profilePic")
      .sort({ createdAt: -1 })
      .limit(40);
    res.send(posts);
  } catch (err) {
    res.status(500).send("error :" + err.message);
  }
});

module.exports = feedRouter;
