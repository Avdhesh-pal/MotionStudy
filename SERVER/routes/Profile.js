import express from "express"
const router = express.Router()

// Middleware
import { auth, isInstructor } from "../middlewares/auth.js"

// Controllers
import {
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
  instructorDashboard,
} from "../controllers/Profile.js"

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************

// Delete user account
router.delete("/deleteProfile", auth, deleteAccount)

// Update profile
router.put("/updateProfile", auth, updateProfile)

// Get user details
router.get("/getUserDetails", auth, getAllUserDetails)

// Get enrolled courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses)

// Update display picture
router.put("/updateDisplayPicture", auth, updateDisplayPicture)

// Instructor dashboard (protected + role-based)
router.get(
  "/instructorDashboard",
  auth,
  isInstructor,
  instructorDashboard
)

// Export router
export default router
