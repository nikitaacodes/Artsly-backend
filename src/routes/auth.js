const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    const { name, userName, emailId, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      userName,
      emailId,
      password: passwordHash,
    });

    await user.save();
    console.log("User created with ID:", user._id);

    res.status(201).json({
      message: "User created successfully",
      userId: user._id,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId.toLowerCase() });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found, email isn't present" });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password isn't correct" });
    }

    const token = await user.getJWT();
    console.log("Token:", token);

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
      httpOnly: true, // 🔒 security best practice
      sameSite: "Lax",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.status(200).json({ message: "Logout successful" });
});

module.exports = authRouter;
