import User from "../models/User.js";
import mailSender from "../utils/mailSender.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Request password reset OTP (sent to email)
export const requestPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Email is not registered" });
    }

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    await User.findOneAndUpdate(
      { email },
      {
        resetOTP: hashedOtp,
        resetOTPExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
      },
      { new: true }
    );

    await mailSender(
      email,
      "Password Reset OTP",
      `Your One Time Password (OTP) to reset your password is <b>${otp}</b>. It will expire in 10 minutes.`
    );

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    return res.json({ success: false, message: "Error sending OTP", error: error.message });
  }
};

// Reset password using OTP
export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.json({ success: false, message: "Password and Confirm Password do not match" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Email is not registered" });
    }

    if (!(user.resetOTPExpires > Date.now())) {
      return res.status(403).json({ success: false, message: "OTP is expired, please request a new one" });
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashedOtp !== user.resetOTP) {
      return res.status(403).json({ success: false, message: "Invalid OTP" });
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { email },
      {
        password: encryptedPassword,
        resetOTP: null,
        resetOTPExpires: null,
      },
      { new: true }
    );

    return res.json({ success: true, message: "Password has been reset successfully" });
  } catch (error) {
    return res.json({ success: false, message: "Error resetting password", error: error.message });
  }
};
