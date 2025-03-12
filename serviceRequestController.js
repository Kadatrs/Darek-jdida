const ServiceRequest = require("../models/ServiceRequest");

// ✅ Create a Service Request (User)
const createServiceRequest = async (req, res) => {
  try {

    // // ✅ Ensure the request creator is a User (not a Worker)
    // if (!req.user || req.user.__t !== "User") {
    //   return res.status(403).json({ message: "Only users can create service requests" });
    // }

    const { description, image_urls, location, category } = req.body;

    if (!description || !location || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newRequest = new ServiceRequest({
      user_id: req.user._id, // 🔹 User creating the request
      description,
      image_urls,
      location,
      category
    });

    await newRequest.save();
    res.status(201).json({ message: "Service request created", request: newRequest });
  } catch (error) {
    res.status(500).json({ message: "Error creating request", error: error.message });
  }
};

// ✅ Fetch Nearby Requests (Worker)
const getNearbyRequests = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10 } = req.query; // Default range: 10km

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const nearbyRequests = await ServiceRequest.find({
      location: {
        $geoWithin: {
          $centerSphere: [[parseFloat(longitude), parseFloat(latitude)], maxDistance / 6378.1]
        }
      },
      status: "pending" // Show only unassigned jobs
    });

    res.json({ message: "Nearby service requests", requests: nearbyRequests });
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error: error.message });
  }
};

// ✅ Worker Expresses Interest
const expressInterest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const workerId = req.user._id;

    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) return res.status(404).json({ message: "Request not found" });

    if (!serviceRequest.interested_workers.includes(workerId)) {
      serviceRequest.interested_workers.push(workerId);
      await serviceRequest.save();
    }

    res.json({ message: "Interest registered", request: serviceRequest });
  } catch (error) {
    res.status(500).json({ message: "Error expressing interest", error: error.message });
  }
};

// ✅ User Selects a Worker
const selectWorker = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { workerId } = req.body;

    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) return res.status(404).json({ message: "Request not found" });

    if (!serviceRequest.interested_workers.includes(workerId)) {
      return res.status(400).json({ message: "Worker has not expressed interest" });
    }

    serviceRequest.selected_worker = workerId;
    serviceRequest.status = "accepted";
    await serviceRequest.save();

    res.json({ message: "Worker selected", request: serviceRequest });
  } catch (error) {
    res.status(500).json({ message: "Error selecting worker", error: error.message });
  }
};

// ✅ Update Request Status (Worker Marks as Completed)
const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "interested", "accepted", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status update" });
    }

    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) return res.status(404).json({ message: "Request not found" });

    serviceRequest.status = status;
    await serviceRequest.save();

    res.json({ message: "Request status updated", request: serviceRequest });
  } catch (error) {
    res.status(500).json({ message: "Error updating request status", error: error.message });
  }
};

// ✅ Export Controllers
module.exports = {
  createServiceRequest,
  getNearbyRequests,
  expressInterest,
  selectWorker,
  updateRequestStatus
};
