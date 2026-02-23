import express from "express"
const router = express.Router()

// Import controllers
import {
  login,
  signup,
  sendotp,
  changePassword,
  logout,
} from "../controllers/Auth.js"

import {
  requestPasswordOtp,
  resetPasswordWithOtp,
} from "../controllers/ResetPassword.js"

// Import middleware
import { auth } from "../middlewares/auth.js"


//                                      Authentication routes


// User login
router.post("/login", login)


// User signup
router.post("/signup", signup)

// Send OTP
router.post("/sendotp", sendotp)

// Change password (protected)
router.post("/changepassword", auth, changePassword)

// Logout (protected)
router.post("/logout", auth, logout)

// ********************************************************************************************************
//                                      Reset Password routes
// ********************************************************************************************************

// Generate reset password token
// Request OTP to reset password (email)
router.post("/request-reset-otp", requestPasswordOtp)

// Reset password using OTP
router.post("/reset-password-otp", resetPasswordWithOtp)

// Export router
export default router
