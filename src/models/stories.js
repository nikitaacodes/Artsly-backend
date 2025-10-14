const mongoose = require("mongoose");
const storiesSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaUrl: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    mediaType: {
      type: String,
      enum: ["video", "image"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("story", storiesSchema);
