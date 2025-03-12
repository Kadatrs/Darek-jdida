const mongoose = require("mongoose");

const ServiceRequestSchema = new mongoose.Schema({
  user_id: {        // 🔹 User who created the request
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }, 
  description: { type: String, required: true }, // 🔹 Service request details
  image_urls: { type: [String], default: [] }, // 🔹 List of images (optional)
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  category: { type: String, required: true }, // 🔹 Service category (Plumbing, Electrical, etc.)
  status: {
    type: String,
    enum: ["pending", "interested", "accepted", "completed"],
    default: "pending"
  }, // 🔹 Track request progress
  interested_workers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Worker" }], // 🔹 Workers who want to do the job
  selected_worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", default: null }, // 🔹 The chosen worker
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ServiceRequest", ServiceRequestSchema);
