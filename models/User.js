const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role !== "teacher";
      },
    },
    profileImage: { type: String, default: "" },
    phone: {
      type: String,
      match: [/^\+?[\d\s-]{10,15}$/, "Please provide a valid phone number"],
    },
    address: { type: String },
    qualification: {
      type: String,
      default: "",
      required: function () {
        return this.role === "teacher";
      },
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
      required: function () {
        return this.role === "teacher";
      },
    },
    languages: {
      type: [String],
      default: [],
      required: function () {
        return this.role === "teacher";
      },
    },
    bio: {
      type: String,
      default: "",
      required: function () {
        return this.role === "teacher";
      },
    },
    teachingStyle: {
      type: String,
      default: "",
      required: function () {
        return this.role === "teacher";
      },
    },
    availability: {
      monday: { start: String, end: String },
      tuesday: { start: String, end: String },
      wednesday: { start: String, end: String },
      thursday: { start: String, end: String },
      friday: { start: String, end: String },
      saturday: { start: String, end: String },
      sunday: { start: String, end: String },
    },
    guardianName: {
      type: String,
      default: "",
      required: function () {
        return this.role === "student";
      },
    },
    guardianPhone: {
      type: String,
      default: "",
      match: [
        /^\+?[\d\s-]{10,15}$/,
        "Please provide a valid guardian phone number",
      ],
      required: function () {
        return this.role === "student";
      },
    },
    learningLevel: {
      type: String,
      default: "",
      required: function () {
        return this.role === "student";
      },
    },
    preferredSchedule: {
      days: [String],
      timeRange: { start: String, end: String },
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  console.log("Hashing password for:", this.email);
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    "jkfdhajgjagahjkdhjkahdkjh478djdsjshdf",
    {
      expiresIn: "7d",
    }
  );
};

module.exports = mongoose.model("User", userSchema);
