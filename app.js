// require("dotenv").config();
// const express = require("express");
// const connectDB = require("./config/db");
// const session = require("express-session");
// const passport = require("passport");
// require("./config1/passport"); // Load passport configuration

// const app = express();

// // Debugging: Check environment variables
// console.log(" *** MONGO_URI:", process.env.MONGO_URI);
// console.log(" *** PORT:", process.env.PORT);
// console.log(" *** GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

// // Connect to MongoDB
// connectDB();


// // Middleware
// app.use(express.json());
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "mysecret",
//     resave: false,
//     saveUninitialized: true,
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());

// // Root route
// app.get("/", (req, res) => {
//   res.send("Hello, World! This is the Darek app!!");
// });


// // API routes
// app.use("/api/auth/worker", require("./routes/workerAuth"));
// app.use("/api/auth/user", require("./routes/userAuth"));

// //app.use("/api/auth", require("./routes/userAuth")); 

// // ✅ Import Routes
// app.use("/api/auth", require("./routes/userAuth")); // User Auth Routes
// app.use("/api/auth", require("./routes/workerAuth")); // Worker Auth Routes


// // Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(` *** Server is running on http://localhost:${PORT}`);
// });









require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const morgan = require("morgan");

require("./config1/passport"); // Load passport configuration

const app = express();

// ✅ Debugging: Check environment variables
console.log(" *** MONGO_URI:", process.env.MONGO_URI);
console.log(" *** PORT:", process.env.PORT);
console.log(" *** GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware
app.use(express.json());
app.use(cors()); // 🔹 تمكين CORS للسماح بالوصول من Postman أو الواجهة الأمامية
app.use(morgan("dev")); // 🔹 تسجيل الطلبات الواردة لمزيد من التفاصيل أثناء الاختبار

app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ Root route
app.get("/", (req, res) => {
  res.send("Hello, World! This is the Darek app!!");
});

// ✅ API Routes
app.use("/api/auth/user", require("./routes/userAuth")); // User Auth Routes
app.use("/api/auth/worker", require("./routes/workerAuth")); // Worker Auth Routes
app.use("/api/profile", require("./routes/profileRoutes")); // Profile Routes

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` *** Server is running on http://localhost:${PORT}`);
});
