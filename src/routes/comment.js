const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");

router.post(
  "/",
  auth,
  [
    body("content").notEmpty().withMessage("Content is required"),
    body("post").notEmpty().withMessage("Post ID is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const comment = new Comment({
        content: req.body.content,
        author: req.user.id,
        post: req.body.post,
      });
      await comment.save();
      res.status(201).json(comment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

router.get("/post/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "username")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a comment
router.delete("/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.author.toString() !== req.user.id) {
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
