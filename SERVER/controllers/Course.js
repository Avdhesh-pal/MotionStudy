import Course from "../models/Course.js";
import Category from "../models/Category.js";
import Section from "../models/Section.js";
import SubSection from "../models/Subsection.js";
import User from "../models/User.js";

import { uploadImageToCloudinary } from "../utils/imageUploader.js";
import CourseProgress from "../models/CourseProgress.js";
import { convertSecondsToDuration } from "../utils/secToDuration.js";

// ================= CREATE COURSE =================
export const createCourse = async (req, res) => {
  try {
    const userId = req.user.id;

    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      status,
      instructions: _instructions,
    } = req.body;

    const thumbnail = req.files?.thumbnailImage;

    const tag = JSON.parse(_tag);
    const instructions = JSON.parse(_instructions);

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag.length ||
      !thumbnail ||
      !category ||
      !instructions.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      });
    }

    if (!status) status = "Draft";

    const instructorDetails = await User.findById(userId, {
      accountType: "Instructor",
    });

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor Details Not Found",
      });
    }

    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category Details Not Found",
      });
    }

    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      status,
      instructions,
    });

    await User.findByIdAndUpdate(instructorDetails._id, {
      $push: { courses: newCourse._id },
    });

    await Category.findByIdAndUpdate(category, {
      $push: { courses: newCourse._id },
    });

    return res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    });
  }
};

// ================= EDIT COURSE =================
export const editCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    
    // Fields that shouldn't be updated directly
    const restrictedFields = ["courseId", "_id", "instructor", "studentsEnrolled"];
    
    // Validate courseId
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check instructor authorization
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this course",
      });
    }

    // Handle thumbnail upload
    if (req.files?.thumbnailImage) {
      const thumbnailImage = await uploadImageToCloudinary(
        req.files.thumbnailImage,
        process.env.FOLDER_NAME
      );
      course.thumbnail = thumbnailImage.secure_url;
    }

    // Update allowed fields with proper validation
    const updates = req.body;
    const allowedFields = ["courseName", "courseDescription", "whatYouWillLearn", "price", "category", "status", "tag", "instructions"];

    for (const key of allowedFields) {
      if (key in updates && updates[key] !== undefined && updates[key] !== "") {
        try {
          if (key === "tag" || key === "instructions") {
            // Parse JSON fields safely
            const parsed = typeof updates[key] === "string" 
              ? JSON.parse(updates[key]) 
              : updates[key];
            
            // Validate it's an array
            if (!Array.isArray(parsed)) {
              return res.status(400).json({
                success: false,
                message: `${key} must be an array`,
              });
            }
            course[key] = parsed;
          } else if (key === "category") {
            // Validate category exists
            const categoryExists = await Category.findById(updates[key]);
            if (!categoryExists) {
              return res.status(404).json({
                success: false,
                message: "Category not found",
              });
            }
            course[key] = updates[key];
          } else {
            course[key] = updates[key];
          }
        } catch (parseError) {
          return res.status(400).json({
            success: false,
            message: `Invalid format for ${key}: ${parseError.message}`,
          });
        }
      }
    }

    await course.save();

    // Fetch updated course with populated fields
    const updatedCourse = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      });

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ================= GET ALL COURSES =================
export const getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      { status: "Published" },
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    ).populate("instructor");

    return res.status(200).json({
      success: true,
      data: allCourses,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: "Can't Fetch Course Data",
      error: error.message,
    });
  }
};

// ================= GET COURSE DETAILS =================
export const getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;

    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      });

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((sub) => {
        totalDurationInSeconds += parseInt(sub.timeDuration);
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      data: { courseDetails, totalDuration },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= FULL COURSE DETAILS =================
export const getFullCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      });

    const courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId,
    });

    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((sub) => {
        totalDurationInSeconds += parseInt(sub.timeDuration);
      });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgress?.completedVideos || [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= INSTRUCTOR COURSES =================
export const getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: instructorCourses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    });
  }
};

// ================= DELETE COURSE =================
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    for (const studentId of course.studentsEnroled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      });
    }

    for (const sectionId of course.courseContent) {
      const section = await Section.findById(sectionId);
      if (section) {
        for (const subId of section.subSection) {
          await SubSection.findByIdAndDelete(subId);
        }
      }
      await Section.findByIdAndDelete(sectionId);
    }

    await Course.findByIdAndDelete(courseId);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
