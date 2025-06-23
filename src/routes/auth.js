const express = require("express");
const bcrypt = require("bcrypt");

const User = require("../models/user");
const authRouter = express.Router;

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
    res.send("User created");
  } catch (err) {
    res.status(400).send("error:" + err.message);
  }
});
