const express = require("express");
const feedRouter = express.Router();
const Post = require("../models/posts");
const { userAuth } = require("../middleware/auth");

feedRouter.get("/", userAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate("user", "userName profilePic")
      .populate({
        path: "comments",
        populate: { path: "user", select: "userName profilePic" },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.json({
      posts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

feedRouter.get("/trending", userAuth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "userName profilePic")
      .populate({
        path: "comments",
        populate: { path: "user", select: "userName profilePic" },
      })
      .sort({ likes: -1, createdAt: -1 })
      .limit(20);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = feedRouter;
