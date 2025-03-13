const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Worker = require("../models/Worker"); 

// ✅ Define Protect Middleware
// const protect = async (req, res, next) => {
//     let token = req.header("Authorization");
  
//     if (!token) return res.status(401).json({ message: "Access denied. No token provided." });
  
//     if (token.startsWith("Bearer ")) {
//       token = token.split(" ")[1];
//     }
  
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.userId) || await Worker.findById(decoded.workerId);
  
//       if (!req.user) return res.status(404).json({ message: "User not found" });
  
//       next();
//     } catch (err) {
//       res.status(400).json({ message: "Invalid token" });
//     }
//   };
  
const protect = async (req, res, next) => {
    let token = req.header("Authorization");

    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

    if (token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // ✅ Find the authenticated user (either User or Worker)
        let user = await User.findById(decoded.userId);
        let worker = await Worker.findById(decoded.workerId);

        if (!user && !worker) return res.status(404).json({ message: "User not found" });

        // ✅ Explicitly set `req.userType` to "User" or "Worker"
        req.user = user || worker;
        req.userType = user ? "User" : "Worker";

        console.log("✅ Authenticated as:", req.userType); // Debugging
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid token" });
    }
};

//   // ✅ Ensure Proper Export
//   module.exports = { protect };

const authMiddleware = async (req, res, next) => {
  let token = req.header("Authorization");

  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  // ✅ Extract "Bearer <token>" correctly
  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Token:", decoded); // 🔍 Debugging

    // ✅ Check for User or Worker in database
    const user = await User.findById(decoded.userId);
    const worker = await Worker.findById(decoded.workerId);

    if (!user && !worker) {
      console.log("❌ User/Worker not found in DB:", decoded.userId);
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Explicitly set `req.userType` to "User" or "Worker"
    req.user = user || worker;
    req.userType = user ? "User" : "Worker";

    console.log("✅ Authenticated as:", req.userType); // Debugging

    next();
  } catch (err) {
    console.log("❌ Token Verification Failed:", err.message);
    res.status(400).json({ message: "Invalid token" });
  }
};

// ✅ Ensure Proper Export
module.exports = { protect , authMiddleware };







// const jwt = require("jsonwebtoken");
// const User = require("../models/User");
// const Worker = require("../models/Worker");

// const protect = async (req, res, next) => {
//     let token = req.header("Authorization");

//     if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

//     if (token.startsWith("Bearer ")) {
//         token = token.split(" ")[1];
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
//         // ✅ Find the authenticated user (either User or Worker)
//         let user = await User.findById(decoded.userId);
//         let worker = await Worker.findById(decoded.workerId);

//         if (!user && !worker) return res.status(404).json({ message: "User not found" });

//         // ✅ Explicitly set `req.userType` to "User" or "Worker"
//         req.user = user || worker;
//         req.userType = user ? "User" : "Worker";

//         console.log("✅ Authenticated as:", req.userType); // Debugging
//         next();
//     } catch (err) {
//         res.status(400).json({ message: "Invalid token" });
//     }
// };

// // ✅ Export Middleware
// module.exports = { protect };
