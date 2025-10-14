const express = require("express");
const storyRouter = express.Router();
const Story = require("../models/stories");
const { userAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const FriendRequest = require("../models/Request");
storyRouter.post("/", userAuth, upload.single("media"), async (req, res) => {
  try {
    const user = req.user.id;
  
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
     const story = new Story({
        user,
        mediaUrl: `/uploads/${req.file.filename}`, // save relative path
        mediaType: req.file.mimetype.includes("image") ? "image" : "video",
      });
    await story.save();
    res.status(201).send("story is uploaded");
  } catch (err) {
    console.error(err);
    res.status(400).send("error" + err.message);
  }
});

storyRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const user = req.user._id;
    const list = await FriendRequest.find({
      $or: [
        {
          $and: [
            { $or: [{ sender: user }, { receiver: user }] },
            { status: "accepted" },
          ],
        },
        { sender: user, status: "sent" },
      ],
    });

    const storyList = list.map((fr) =>
      fr.sender.toString() === user.toString() ? fr.receiver : fr.sender
    );

    const twentyFourHourAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const userList = await Story.find({
      user: { $in: storyList },
      createdAt: {
        $gte: twentyFourHourAgo,
      },
    })
      .populate("user", "userName profilePic")
      .sort({ createdAt: -1 });
    res.status(200).json(userList);
  } catch (err) {
    console.error(err);
    res.status(400).send("error" + err.message);
  }
});

module.exports = storyRouter;
