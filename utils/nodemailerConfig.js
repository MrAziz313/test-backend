// utils/nodemailerConfig.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "iqraquranacademy098@gmail.com",
    pass: "bsyv virk ghsa saoz",
  },
});

const sendVerificationEmail = async (email, otp) => {
  const mailOptions = {
    from: "iqraquranacademy098@gmail.com",
    to: email,
    subject: "Verify Your Email - Quran Learning Platform",
    html: `
      <h2>Email Verification</h2>
      <p>Thank you for signing up with our Quran Learning Platform!</p>
      <p>Your new OTP is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes. Please enter it to verify your email.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent to:", email);
  } catch (error) {
    console.error("Email sending error:", error.message, error.stack);
    throw error;
  }
};

module.exports = { sendVerificationEmail };
