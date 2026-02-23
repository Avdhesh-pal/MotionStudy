import express from "express"
const router = express.Router()

// ********************************************************************************************************
//                                      Controllers Imports
// ********************************************************************************************************

// Course Controllers
import {
  createCourse,
  getAllCourses,
  getCourseDetails,
  getFullCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse,
} from "../controllers/Course.js"

// Category Controllers
import {
  showAllCategories,
  createCategory,
  categoryPageDetails,
} from "../controllers/Category.js"

// Section Controllers
import {
  createSection,
  updateSection,
  deleteSection,
} from "../controllers/Section.js"

// Sub-Section Controllers
import {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} from "../controllers/Subsection.js"

// Rating & Review Controllers
import {
  createRating,
  getAverageRating,
  getAllRatingReview,
} from "../controllers/RatingAndReview.js"

// Course Progress Controllers
import {
  updateCourseProgress,
  getProgressPercentage,
} from "../controllers/CourseProgress.js"

// ********************************************************************************************************
//                                      Middleware Imports
// ********************************************************************************************************
import {
  auth,
  isInstructor,
  isStudent,
  isAdmin,
} from "../middlewares/auth.js"

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// Create Course (Instructor only)
router.post("/createCourse", auth, isInstructor, createCourse)

// Edit Course
router.post("/editCourse", auth, isInstructor, editCourse)

// Section routes
router.post("/addSection", auth, isInstructor, createSection)
router.post("/updateSection", auth, isInstructor, updateSection)
router.post("/deleteSection", auth, isInstructor, deleteSection)

// Sub-Section routes
router.post("/addSubSection", auth, isInstructor, createSubSection)
router.post("/updateSubSection", auth, isInstructor, updateSubSection)
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)

// Instructor Courses
router.get(
  "/getInstructorCourses",
  auth,
  isInstructor,
  getInstructorCourses
)

// All Courses
router.get("/getAllCourses", getAllCourses)

// Course Details
router.post("/getCourseDetails", getCourseDetails)
router.post("/getFullCourseDetails", auth, getFullCourseDetails)

// Course Progress
router.post(
  "/updateCourseProgress",
  auth,
  isStudent,
  updateCourseProgress
)
// router.post("/getProgressPercentage", auth, isStudent, getProgressPercentage)

// Delete Course
router.delete("/deleteCourse", deleteCourse)

// ********************************************************************************************************
//                                      Category routes (Admin only)
// ********************************************************************************************************
router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/showAllCategories", showAllCategories)
router.post("/getCategoryPageDetails", categoryPageDetails)

// ********************************************************************************************************
//                                      Rating and Review routes
// ********************************************************************************************************
router.post("/createRating", auth, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRatingReview)

// Export router
export default router
