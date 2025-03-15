const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, refPath: "senderType", required: true },
  senderType: { type: String, enum: ["User", "Worker"], required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, refPath: "receiverType", required: true },
  receiverType: { type: String, enum: ["User", "Worker"], required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
