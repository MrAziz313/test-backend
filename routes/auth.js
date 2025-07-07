const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/register",
  upload.single("profileImage"),
  authController.registerUser
);

router.post("/verify-email", authController.verifyEmail);
router.post("/resend-otp", authController.resendOTP);
router.post("/login", authController.loginUser);
router.put(
  "/update-profile",
  authMiddleware,
  upload.single("profileImage"),
  authController.updateProfile
);

module.exports = router;
