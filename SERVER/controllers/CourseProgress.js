import mongoose from "mongoose"
import Section from "../models/Section.js"
import SubSection from "../models/Subsection.js"
import CourseProgress from "../models/CourseProgress.js"
import Course from "../models/Course.js"

export const updateCourseProgress = async (req, res) => {
  const { courseId, subsectionId } = req.body
  const userId = req.user.id

  try {
    // Check if the subsection is valid
    const subsection = await SubSection.findById(subsectionId)
    if (!subsection) {
      return res.status(404).json({ error: "Invalid subsection" })
    }

    // Find the course progress document for the user and course
    const courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    })

    if (!courseProgress) {
      return res.status(404).json({
        success: false,
        message: "Course progress does not exist",
      })
    }

    // Check if subsection already completed
    if (courseProgress.completedVideos.includes(subsectionId)) {
      return res.status(400).json({
        error: "Subsection already completed",
      })
    }

    // Mark subsection as completed
    courseProgress.completedVideos.push(subsectionId)

    // Save progress
    await courseProgress.save()

    return res.status(200).json({
      success: true,
      message: "Course progress updated",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
}

export const getProgressPercentage = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id

    // Get course with sections and subsections
    const course = await Course.findById(courseId).populate({
      path: "courseContent",
      populate: { path: "subSection" },
    })

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" })
    }

    // Count total subsections
    let totalSubSections = 0
    for (const section of course.courseContent) {
      if (section.subSection && section.subSection.length) {
        totalSubSections += section.subSection.length
      }
    }

    // Get user's course progress
    const progress = await CourseProgress.findOne({ courseID: courseId, userId })
    const completed = progress ? progress.completedVideos.length : 0

    const percentage = totalSubSections > 0 ? Math.round((completed / totalSubSections) * 100) : 0

    return res.status(200).json({
      success: true,
      percentage,
      completed,
      total: totalSubSections,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}
