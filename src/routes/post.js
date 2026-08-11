const express = require("express");
const Post = require("../models/posts");
const User = require("../models/user");
const { userAuth } = require("../middleware/auth");
const { checkRole } = require("../middleware/rbac");
const { postLimiter } = require("../middleware/rateLimiter");
const upload = require("../middleware/upload");
const { bucket } = require("../config/firebase");

const postRouter = express.Router();

const uploadToFirebase = async (file) => {
  if (!file) return null;
  const filename = `${Date.now()}-${file.originalname}`;
  const fileUpload = bucket.file(`posts/${filename}`);

  await fileUpload.save(file.buffer, {
    metadata: {
      contentType: file.mimetype,
    },
  });

  const [url] = await fileUpload.getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
  });

  return url;
};

postRouter.post(
  "/post",
  userAuth,
  postLimiter,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Content is required" });
      }

      const imageUrls = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const url = await uploadToFirebase(file);
          if (url) imageUrls.push(url);
        }
      }

      const post = new Post({
        user: req.user._id,
        content: content.trim(),
        images: imageUrls,
      });

      await post.save();
      await post.populate("user", "userName profilePic");

      res.status(201).json({
        message: "Post created successfully",
        post,
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
);

postRouter.get("/post/:id", userAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "userName profilePic")
      .populate({
        path: "comments",
        populate: { path: "user", select: "userName profilePic" },
      });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

postRouter.delete("/deletepost/:id", userAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (
      post.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

postRouter.patch(
  "/post/:id",
  userAuth,
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { content } = req.body;
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (post.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      if (content) post.content = content.trim();

      if (req.files && req.files.length > 0) {
        const newUrls = [];
        for (const file of req.files) {
          const url = await uploadToFirebase(file);
          if (url) newUrls.push(url);
        }
        post.images = [...post.images, ...newUrls];
      }

      await post.save();
      await post.populate("user", "userName profilePic");

      res.json({ message: "Post updated successfully", post });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
);

postRouter.post("/post/:id/like", userAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user._id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
      await post.save();
      return res.json({ message: "Like removed", likes: post.likes.length });
    }

    post.likes.push(userId);
    await post.save();
    res.json({ message: "Post liked", likes: post.likes.length });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

postRouter.post("/post/:id/share", userAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.shares += 1;
    await post.save();
    res.json({ message: "Post shared", shares: post.shares });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = postRouter;
