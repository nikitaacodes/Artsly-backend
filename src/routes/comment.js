const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");
const { userAuth } = require("../middleware/auth");

//post a comment
router.post("/", userAuth, async (req, res) => {
  const { comment, post } = req.body;
  if (!post || typeof post !== "string" || !post.trim()) {
    return res.status(400).json({ error: "post id is required" });
  }
  if (!comment || typeof comment !== "string" || !comment.trim()) {
    return res.status(400).json({ error: "comment is required" });
  }
  try {
    const savedComment = new Comment({
      comment: comment.trim(),
      user: req.user.id,
      post: post.trim(),
    });
    await savedComment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
//get comments
//comments/post/:postId
router.get("/post/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "username")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a comment
router.delete("/:id", userAuth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await comment.remove();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
