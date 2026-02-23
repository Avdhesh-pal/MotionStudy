import Section from "../models/Section.js"
import Course from "../models/Course.js"
import SubSection from "../models/Subsection.js"

// CREATE a new section
export const createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body

    // Validate input
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing required properties",
      })
    }

    // Create section
    const newSection = await Section.create({ sectionName })

    // Add section to course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourse,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// UPDATE a section
export const updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId, courseId } = req.body

    await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    )

    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: course,
    })
  } catch (error) {
    console.error("Error updating section:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// DELETE a section
export const deleteSection = async (req, res) => {
  try {
    const { sectionId, courseId } = req.body

    // Remove section reference from course
    await Course.findByIdAndUpdate(courseId, {
      $pull: {
        courseContent: sectionId,
      },
    })

    const section = await Section.findById(sectionId)

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      })
    }

    // Delete related subsections
    await SubSection.deleteMany({ _id: { $in: section.subSection } })

    // Delete section
    await Section.findByIdAndDelete(sectionId)

    // Fetch updated course
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.status(200).json({
      success: true,
      message: "Section deleted",
      data: course,
    })
  } catch (error) {
    console.error("Error deleting section:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
