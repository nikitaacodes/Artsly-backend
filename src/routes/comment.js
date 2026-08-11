const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");
const Post = require("../models/posts");
const { userAuth } = require("../middleware/auth");
const { commentLimiter } = require("../middleware/rateLimiter");

router.post("/", userAuth, commentLimiter, async (req, res) => {
  try {
    const { comment, post } = req.body;
    if (!post || typeof post !== "string" || !post.trim()) {
      return res.status(400).json({ error: "Post ID is required" });
    }
    if (!comment || typeof comment !== "string" || !comment.trim()) {
      return res.status(400).json({ error: "Comment is required" });
    }

    const postExists = await Post.findById(post);
    if (!postExists) {
      return res.status(404).json({ error: "Post not found" });
    }

    const savedComment = new Comment({
      comment: comment.trim(),
      user: req.user._id,
      post: post.trim(),
    });
    await savedComment.save();

    postExists.comments.push(savedComment._id);
    await postExists.save();

    await savedComment.populate("user", "userName profilePic");
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/post/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "userName profilePic")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", userAuth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (
      comment.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Comment.findByIdAndDelete(req.params.id);
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: req.params.id },
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id", userAuth, async (req, res) => {
  try {
    const { comment: newComment } = req.body;
    if (!newComment || !newComment.trim()) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    comment.comment = newComment.trim();
    await comment.save();
    await comment.populate("user", "userName profilePic");

    res.json({ message: "Comment updated", comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
