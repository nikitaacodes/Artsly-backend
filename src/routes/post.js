const express = require("express");
const bcrypt = require("bcrypt");

//models
const User = require("../models/user");
const Post = require("../models/posts");
//middleware
const { userAuth } = require("../middleware/auth");
const postRouter = express.Router();

//create a post
postRouter.post("/post", userAuth, async (req, res) => {
  try {
    const user = req.user.id;
    const { content } = req.body;

    const post = new Post({
      user: user,
      content,
    });

    await post.save();
    res.status(201).json({
      message: "post created",
      post,
    });
  } catch (err) {
    res.status(400).send("error:" + err.message);
  }
});

//delete a post
postRouter.delete("/deletepost/:id", userAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "post not found" });
    if (post.user.toString() !== req.user.id)
      return res.status(403).json({ message: "unauthorized" });
    await post.deleteOne();
    res.json({ message: "post deleted" });
  } catch (err) {
    res.status(400).send("error" + err.message);
  }
});

module.exports = postRouter;
