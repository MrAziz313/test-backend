const mongoose = require("mongoose");
const uploadImage = require("../utils/uploadToImageKit");
const User = require("../models/User");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../utils/nodemailerConfig");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = "jkfdhajgjagahjkdhjkahdkjh478djdsjshdf";
exports.registerUser = async (req, res) => {
  console.log("Register API hit"); // <-- add this

  try {
    console.log("Request body:", req.body); // <-- add this
    const { name, email, password, confirmPassword, role } = req.body;
    if (!name || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters, with 1 uppercase, 1 number, and 1 special character",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    let additionalFields = {};
    // if (role === "teacher") {
    //   const {
    //     profileImage,
    //     qualification,
    //     experienceYears,
    //     languages,
    //     bio,
    //     teachingStyle,
    //   } = req.body;
    //   if (
    //     !profileImage ||
    //     !qualification ||
    //     !experienceYears ||
    //     !languages ||
    //     !bio ||
    //     !teachingStyle
    //   ) {
    //     return res
    //       .status(400)
    //       .json({ error: "All teacher-specific fields are required" });
    //   }
    //   additionalFields = {
    //     profileImage,
    //     qualification,
    //     experienceYears,
    //     languages,
    //     bio,
    //     teachingStyle,
    //   };
    // } else if (role === "student") {
    //   const { guardianName, guardianPhone, learningLevel } = req.body;
    //   if (!guardianName || !guardianPhone || !learningLevel) {
    //     return res
    //       .status(400)
    //       .json({ error: "All student-specific fields are required" });
    //   }
    //   additionalFields = { guardianName, guardianPhone, learningLevel };
    // }
    if (role === "teacher") {
      const { qualification, experienceYears, languages, bio, teachingStyle } =
        req.body;

      if (
        !qualification ||
        !experienceYears ||
        !languages ||
        !bio ||
        !teachingStyle
      ) {
        return res
          .status(400)
          .json({ error: "All teacher-specific fields are required" });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ error: "Profile image is required for teachers" });
      }

      // Upload image to ImageKit
      const uploadedImageUrl = await uploadImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      additionalFields = {
        profileImage: uploadedImageUrl,
        qualification,
        experienceYears,
        languages,
        bio,
        teachingStyle,
      };
    } else if (role === "student") {
      const { guardianName, guardianPhone, learningLevel } = req.body;

      if (!guardianName || !guardianPhone || !learningLevel) {
        return res
          .status(400)
          .json({ error: "All student-specific fields are required" });
      }

      let uploadedImageUrl =
        "https://ik.imagekit.io/jatz7lewi/default-avatar.png"; // default image
      if (req.file) {
        uploadedImageUrl = await uploadImage(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );
      }

      additionalFields = {
        profileImage: uploadedImageUrl,
        guardianName,
        guardianPhone,
        learningLevel,
      };
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 30 * 60 * 1000;

    const user = new User({
      name,
      email,
      password, // Plain password, will be hashed by pre-save hook
      role,
      otp,
      otpExpires,
      ...additionalFields,
    });

    await user.save().catch((saveError) => {
      console.error("User save error:", saveError.message, saveError.stack);
      throw new Error("Failed to save user");
    });

    try {
      await sendVerificationEmail(email, otp);
    } catch (emailError) {
      console.error(
        "Email sending error:",
        emailError.message,
        emailError.stack
      );
      throw new Error("Failed to send verification email");
    }

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const tempToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "10m",
    });

    res.status(201).json({
      message: "Registration successful. Please check your email for OTP.",
      userId: user._id,
      token: tempToken,
    });
  } catch (error) {
    console.error("Registration Error:", error.message, error.stack);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

// Other functions remain same
exports.verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findOne({ otp, otpExpires: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify Email Error:", error.message, error.stack);
    res.status(500).json({ error: "Server error" });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 30 * 60 * 1000;
    await user.save();
    await sendVerificationEmail(user.email, otp);
    res.status(200).json({ message: "New OTP sent to your email" });
  } catch (error) {
    console.error("Resend OTP Error:", error.message, error.stack);
    res.status(500).json({ error: "Server error" });
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("emil", email);

    console.log("Login attempt for email:", email, "with password:", password);
    const user = await User.findOne({ email }).select("+password");
    console.log("Found user with password:", user);

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (!user.password) {
      return res
        .status(500)
        .json({ error: "User password not found in database" });
    }

    if (!(await user.comparePassword(password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ error: "Please verify your email first" });
    }

    const token = user.generateToken(); // Use schema method
    res.status(200).json({
      message: "Login successful",
      token,
      data: {
        user: {
          email: user.email,
          role: user.role,
          name: user.name,
          profileImage: user.profileImage,
        },
      },
      meta: { token },
    });
  } catch (error) {
    console.error("Login Error:", error.message, error.stack);
    res.status(500).json({ error: error.message || "Server error" });
  }
};
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware
    const { name, password, bio } = req.body;

    // Prepare update object
    const updateData = {};

    if (name) {
      updateData.name = name;
    }

    if (bio) {
      updateData.bio = bio;
    }

    // Handle password update
    if (password) {
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error:
            "Password must be at least 8 characters, with 1 uppercase, 1 number, and 1 special character",
        });
      }
      updateData.password = await bcrypt.hash(password, 10); // Hash new password
    }

    // Handle profile image upload
    if (req.file) {
      const uploadedImageUrl = await uploadImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      updateData.profileImage = uploadedImageUrl;
    }

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("name email profileImage bio role");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      data: {
        user: {
          name: updatedUser.name,
          email: updatedUser.email,
          profileImage: updatedUser.profileImage,
          bio: updatedUser.bio,
          role: updatedUser.role,
        },
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error.message, error.stack);
    res.status(500).json({ error: error.message || "Server error" });
  }
};
