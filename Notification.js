const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "recipientType", // Can reference either User or Worker
      required: true,
    },
    recipientType: {
      type: String,
      enum: ["User", "Worker"], // Specifies whether the recipient is a user or worker
      required: true,
    },
    message: { type: String, required: true }, // Notification content
    isRead: { type: Boolean, default: false }, // Tracks if the notification has been read
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

const Notification = mongoose.model("Notification", NotificationSchema);
module.exports = Notification;
