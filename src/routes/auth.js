const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { strictLimiter } = require("../middleware/rateLimiter");
const { userAuth } = require("../middleware/auth");
const authRouter = express.Router();

authRouter.post("/signup", strictLimiter, async (req, res) => {
  try {
    const { name, userName, emailId, password } = req.body;

    if (!name || !userName || !emailId || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ emailId: emailId.toLowerCase() }, { userName }],
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Email or username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      userName,
      emailId: emailId.toLowerCase(),
      password: passwordHash,
    });

    await user.save();

    res.status(201).json({
      message: "User created successfully",
      userId: user._id,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

authRouter.post("/login", strictLimiter, async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ emailId: emailId.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = await user.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: true,
      sameSite: "Lax",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        userName: user.userName,
        emailId: user.emailId,
        profilePic: user.profilePic,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

authRouter.post("/logout", userAuth, async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.status(200).json({ message: "Logout successful" });
});

module.exports = authRouter;
