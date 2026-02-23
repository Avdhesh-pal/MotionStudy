import RatingAndReview from "../models/RatingandReview.js"
import Course from "../models/Course.js"
import mongoose from "mongoose"

// Create a new rating and review
export const createRating = async (req, res) => {
  try {
    const userId = req.user.id
    const { rating, review, courseId } = req.body

    // Check if the user is enrolled in the course
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnroled: { $elemMatch: { $eq: userId } },
    })

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in this course",
      })
    }

    // Check if the user has already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    })

    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course already reviewed by user",
      })
    }

    // Create rating & review
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    })

    // Add review reference to course
    await Course.findByIdAndUpdate(courseId, {
      $push: {
        ratingAndReviews: ratingReview._id,
      },
    })

    return res.status(201).json({
      success: true,
      message: "Rating and review created successfully",
      ratingReview,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

// Get average rating of a course
export const getAverageRating = async (req, res) => {
  try {
    const { courseId } = req.body

    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ])

    return res.status(200).json({
      success: true,
      averageRating: result.length > 0 ? result[0].averageRating : 0,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve the rating for the course",
      error: error.message,
    })
  }
}

// Get all rating and reviews
export const getAllRatingReview = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: -1 })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })

    res.status(200).json({
      success: true,
      data: allReviews,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve rating and review",
      error: error.message,
    })
  }
}
