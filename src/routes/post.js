const express = require("express");
const bcrypt = require("bcrypt");

//models
const User = require("../models/user");
const Post = require("../models/posts");
//middleware
const { userAuth } = require("../middleware/auth");

const postRouter = express.Router();

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

module.exports = postRouter;
