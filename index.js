require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const app = express();
const authRoutes = require("./routes/auth");
const port = 3001;

app.use(
  cors({
    origin:
      "https://online-islamic-institute-admin.vercel.app" ||
      "http://localhost:3001",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello");
});
app.use("/api/auth", authRoutes);
// Rate limiter for resend OTP
const resendOTPLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 requests per window
  message: "Too many OTP resend requests, please try again later.",
});

mongoose
  .connect(
    "mongodb+srv://admin:admin123@cluster0.eluborj.mongodb.net/quranInstitute?retryWrites=true&w=majority&appName=Cluster0",
    {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      maxPoolSize: 10, // Limit connection pool
      autoIndex: false, // Disable auto index for performance
    }
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

app.listen(port, () => {
  console.log(`Serveris starting on Poart ${port}`);
});
