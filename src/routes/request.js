const express = require("express");
const { userAuth } = require("../middleware/auth");
const fRequest = require("../models/Request");
const reqRouter = express.Router();
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
module.exports = reqRouter;
