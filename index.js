require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const serverless = require("serverless-http");
const cors = require("cors");
// const rateLimit = require("express-rate-limit");
// const authRoutes = require("../routes/auth");
// const adminRoutes = require("../routes/admin");
// const profileRoutes = require("../routes/profileRoutes");
// const courseRoutes = require("../routes/courseRoutes");
// const userRoutes = require("../routes/userRoutes");

const app = express();
const PORT = 5000;

// Rate limiter for resend OTP
// const resendOTPLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // Limit to 5 requests per window
//   message: "Too many OTP resend requests, please try again later.",
// });

// Middleware
app.use(
  cors({
    origin:
      "https://online-islamic-institute-admin.vercel.app" ||
      "http://localhost:3003",
    credentials: true,
  })
);
app.use(express.json()); 
// MongoDB connection
// mongoose
//   .connect(
//     "mongodb+srv://islamic_institute:KBasUcG5v7IIKPoL@cluster0.zxklh5p.mongodb.net/islamic_institute_db?retryWrites=true&w=majority&appName=Cluster0",
//     // {
//     //   serverSelectionTimeoutMS: 5000,
//     //   socketTimeoutMS: 45000,
//     //   maxPoolSize: 10,
//     //   autoIndex: true,
//     // }
//   )
//   .then(() =>
//     console.log(
//       "MongoDB connected:",
//       "mongodb+srv://islamic_institute:KBasUcG5v7IIKPoL@cluster0.zxklh5p.mongodb.net/islamic_institute_db?retryWrites=true&w=majority&appName=Cluster0"
//     )
//   )
//   .catch((err) =>
//     console.error("MongoDB connection error:", err.message, err.stack)
//   );

// Routes
app.get("/", (req, res) => {
  res.send("Online Quran Platform Backend Running");
});

// app.use("/api/auth", authRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/profile", profileRoutes);
// app.use("/api/courses", courseRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/auth/resend-otp", resendOTPLimiter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global error handling
// app.use((err, req, res, next) => {
//   console.error("Error:", err.message, err.stack);
//   if (err.code === "LIMIT_FILE_SIZE") {
//     return res.status(400).json({ message: "File size must not exceed 5MB" });
//   }
//   res.status(500).json({
//     message:
//       process.env.NODE_ENV === "development"
//         ? err.message
//         : "Something went wrong!",
//   });
// });

app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

module.exports = serverless(app);
