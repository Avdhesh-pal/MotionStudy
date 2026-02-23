import mongoose from "mongoose"

import Profile from "../models/Profile.js"
import CourseProgress from "../models/CourseProgress.js"
import Course from "../models/Course.js"
import User from "../models/User.js"

import { uploadImageToCloudinary } from "../utils/imageUploader.js"
import { convertSecondsToDuration } from "../utils/secToDuration.js"

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, about, contactNumber, gender } = req.body

    const id = req.user.id

    // Find user & profile
    const userDetails = await User.findById(id)
    if (!userDetails) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    const profile = await Profile.findById(userDetails.additionalDetails)

    // Build update objects only with provided fields (partial update)
    const userUpdate = {}
    if (typeof firstName !== "undefined" && firstName !== null && String(firstName).trim() !== "") {
      userUpdate.firstName = firstName
    }
    if (typeof lastName !== "undefined" && lastName !== null && String(lastName).trim() !== "") {
      userUpdate.lastName = lastName
    }

    if (Object.keys(userUpdate).length) {
      await User.findByIdAndUpdate(id, { $set: userUpdate }, { new: true, runValidators: true })
    }

    const profileUpdate = {}
    if (typeof dateOfBirth !== "undefined" && dateOfBirth !== null && String(dateOfBirth).trim() !== "") {
      profileUpdate.dateOfBirth = dateOfBirth
    }
    if (typeof about !== "undefined" && about !== null && String(about).trim() !== "") {
      profileUpdate.about = about
    }
    if (typeof contactNumber !== "undefined" && contactNumber !== null && String(contactNumber).trim() !== "") {
      profileUpdate.contactNumber = contactNumber
    }
    if (typeof gender !== "undefined" && gender !== null && String(gender).trim() !== "") {
      profileUpdate.gender = gender
    }

    if (Object.keys(profileUpdate).length) {
      await Profile.findByIdAndUpdate(profile._id, { $set: profileUpdate }, { new: true, runValidators: true })
    }

    // Fetch updated user
    const updatedUserDetails = await User.findById(id).populate("additionalDetails").exec()

    return res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

//  DELETE ACCOUNT 
export const deleteAccount = async (req, res) => {
  try {
    const id = req.user.id

    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Delete profile
    await Profile.findByIdAndDelete(
      new mongoose.Types.ObjectId(user.additionalDetails)
    )

    // Remove user from enrolled courses
    for (const courseId of user.courses) {
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnroled: id } },
        { new: true }
      )
    }

    // Delete course progress
    await CourseProgress.deleteMany({ userId: id })

    // Delete user
    await User.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "User cannot be deleted successfully",
    })
  }
}

// GET USER DETAILS
export const getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id

    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()

    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ================== UPDATE DISPLAY PICTURE ==================
export const updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id

    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )

    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      { image: image.secure_url },
      { new: true }
    )

    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ================== GET ENROLLED COURSES ==================
export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id

    let userDetails = await User.findOne({ _id: userId })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      })
    }

    userDetails = userDetails.toObject()

    for (let i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      let subSectionLength = 0

      for (let j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce(
          (acc, curr) => acc + parseInt(curr.timeDuration),
          0
        )

        subSectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length
      }

      userDetails.courses[i].totalDuration =
        convertSecondsToDuration(totalDurationInSeconds)

      const courseProgress = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId,
      })

      const completedCount = courseProgress?.completedVideos.length || 0

      userDetails.courses[i].progressPercentage =
        subSectionLength === 0
          ? 100
          : Math.round((completedCount / subSectionLength) * 100 * 100) / 100
    }

    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// ================== INSTRUCTOR DASHBOARD ==================
export const instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({
      instructor: req.user.id,
    })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnroled.length
      const totalAmountGenerated = totalStudentsEnrolled * course.price

      return {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        totalStudentsEnrolled,
        totalAmountGenerated,
      }
    })

    res.status(200).json({ courses: courseData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}
