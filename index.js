require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const app = express();
const serverless = require("serverless-http");

const port = 3001;

app.use(
  cors({
    origin:
      "http://localhost:5173" ||
      "http://localhost:3001",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello welcome to backend");
});
// Rate limiter for resend OTP
const resendOTPLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 requests per window
  message: "Too many OTP resend requests, please try again later.",
});

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
    autoIndex: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err.message));


module.exports = serverless(app);