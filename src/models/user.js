const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      unique: true,
      required: true,
      minlength: 3,
      maxlength: 10,
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      min: 12,
    },
    gender: {
      type: String,
      enum: ["male", "female", "others"],
    },
    profilePic: {
      type: String,
    },
    about: {
      type: String,
      default: "this is default ",
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "2d",
  });
  return token;
};
userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );
  return isPasswordValid;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
