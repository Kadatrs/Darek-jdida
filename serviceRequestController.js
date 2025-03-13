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

    // Ensure location.coordinates is an array of two numbers (longitude, latitude)
    if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      return res.status(400).json({ message: "Invalid location coordinates" });
    }

    const [longitude, latitude] = location.coordinates;
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
    return res.status(400).json({ message: "Invalid longitude or latitude values" });
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

    // Validate latitude and longitude
    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    // Parse latitude, longitude, and maxDistance as numbers
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const distance = parseFloat(maxDistance);

    // Check if parsed values are valid numbers
    if (isNaN(lat) || isNaN(lng) || isNaN(distance)) {
      return res.status(400).json({ message: "Invalid latitude, longitude, or maxDistance values" });
    }

    // Validate latitude and longitude ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ message: "Invalid latitude or longitude values" });
    }

    // Fetch nearby requests using GeoJSON query
    const nearbyRequests = await ServiceRequest.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat] // GeoJSON uses [longitude, latitude]
          },
          $maxDistance: distance * 1000 // Convert km to meters
        }
      },
      status: "pending" // Show only unassigned jobs
    });

    res.json({ message: "Nearby service requests", requests: nearbyRequests });
  } catch (error) {
    console.error("Error fetching nearby requests:", error.message);
    res.status(500).json({ message: "Error fetching requests", error: error.message });
  }
};


// ✅ Worker Expresses Interest
const expressInterest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const workerId = req.user._id; // ✅ Get authenticated worker's ID

    // ✅ Ensure only workers can express interest
    if (!req.user || req.user.__t == "User") {
      return res.status(403).json({ message: "Only workers can express interest in a request" });
    }

    // ✅ Find the service request
    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) return res.status(404).json({ message: "Request not found" });

    // ✅ Prevent duplicate interest
    if (serviceRequest.interested_workers.includes(workerId)) {
      return res.status(400).json({ message: "You have already expressed interest in this request" });
    }

    // ✅ Add worker to interested_workers array
    serviceRequest.interested_workers.push(workerId);
    await serviceRequest.save();

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

        // ✅ Ensure only users can select a worker
        if (req.userType !== "User") {
            return res.status(403).json({ message: "Only users can select a worker" });
        }

        // ✅ Find the service request
        const serviceRequest = await ServiceRequest.findById(requestId);
        if (!serviceRequest) return res.status(404).json({ message: "Request not found" });

        // ✅ Ensure the request belongs to the authenticated user
        if (serviceRequest.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only assign workers to your own requests" });
        }

        // ✅ Ensure the worker has expressed interest
        if (!serviceRequest.interested_workers.includes(workerId)) {
            return res.status(400).json({ message: "Worker has not expressed interest in this request" });
        }

        // ✅ Assign the worker and update status
        serviceRequest.selected_worker = workerId;
        serviceRequest.status = "accepted";
        await serviceRequest.save();

        res.json({ message: "Worker selected successfully", request: serviceRequest });
    } catch (error) {
        res.status(500).json({ message: "Error selecting worker", error: error.message });
    }
};


// ✅ Update Request Status (Worker Marks as Completed)
const updateRequestStatus = async (req, res) => {
  try {
      const { requestId } = req.params;
      const { status } = req.body;

      // ✅ Only allow valid status updates
      const validStatuses = ["pending", "accepted", "completed"];
      if (!validStatuses.includes(status)) {
          return res.status(400).json({ message: "Invalid status update" });
      }

      // ✅ Find the service request
      const serviceRequest = await ServiceRequest.findById(requestId);
      if (!serviceRequest) return res.status(404).json({ message: "Request not found" });

      // ✅ Check permission: Only the user can update to "accepted"
      if (status === "accepted" && req.userType !== "User") {
          return res.status(403).json({ message: "Only users can accept a worker" });
      }

      // ✅ Check permission: Only the assigned worker can update to "completed"
      if (status === "completed" && req.userType !== "Worker") {
          return res.status(403).json({ message: "Only the assigned worker can mark as completed" });
      }

      // ✅ Ensure only the assigned worker marks "completed"
      if (status === "completed" && req.user._id.toString() !== serviceRequest.selected_worker?.toString()) {
          return res.status(403).json({ message: "Only the assigned worker can complete this request" });
      }

      // ✅ Update the request status
      serviceRequest.status = status;
      await serviceRequest.save();

      res.json({ message: `Request status updated to '${status}'`, request: serviceRequest });
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











