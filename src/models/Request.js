const mongoose = require("mongoose");

const frSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["accepted", "rejected", "sent"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  }
);

const fRequest = mongoose.model("friendrequest", frSchema);
module.exports = fRequest;
