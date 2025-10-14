const express = require("express");
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");
const fRequest = require("../models/Request");
const reqRouter = express.Router();

const mongoose = require("mongoose");

reqRouter.get("/sent", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const sentReq = await fRequest
      .find({
        sender: userId,
        //all sent request
      })
      .populate("receiver", "name userName emailId profilePic");
    res.send(sentReq);
  } catch (err) {
    res.status(500).send("error" + err.message);
  }
});

reqRouter.get("/received", userAuth, async (req, res) => {
  //received req
  try {
    const userId = req.user._id;
    const receivedReq = await fRequest
      .find({ receiver: userId, status: "sent" })
      .populate("sender", "name userName emailId profilePic");

    res.send(receivedReq);
  } catch (err) {
    res.status(500).send("error" + err.message);
  }
});
reqRouter.post("/send", userAuth, async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ error: "receiver id is required" });
    }
    if (senderId.toString() === receiverId) {
      return res.status(400).json({
        error: "you cant send to yourself",
      });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(400).json({
        error: "reciever not found",
      });
    }

    const existingReq = await fRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });
    if (existingReq) {
      return res.status(400).json({ error: "friend request already exists" });
    }

    const newReq = await fRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: "sent",
    });
    res.status(201).json({ message: "friend request sent ", request: newReq });
  } catch (err) {
    res.status(500).send("error" + err.message);
  }
});

reqRouter.patch("/accept/:requestId", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ error: "Invalid request ID" });
    }

    const friendRequest = await fRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    if (friendRequest.receiver.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    res.status(200).json({
      message: "Friend request accepted",
      request: friendRequest,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

reqRouter.delete("/delete/:requestId", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;
    const friendReq = await fRequest.findById(requestId);
    if (!friendReq) {
      return res.status(404).json({ error: "friend req not found" });
    }

    if (
      friendReq.sender.toString() !== userId.toString() &&
      friendReq.receiver.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        error: "not authorized",
      });
    }

    await fRequest.findByIdAndDelete(requestId);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = reqRouter;
