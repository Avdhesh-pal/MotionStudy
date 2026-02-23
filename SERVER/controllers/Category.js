import Category from "../models/Category.js"

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
}

// Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    const categoryDetails = await Category.create({
      name,
      description,
    })

    console.log(categoryDetails)

    return res.status(200).json({
      success: true,
      message: "Category Created Successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Show all categories
export const showAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find()

    res.status(200).json({
      success: true,
      data: allCategories,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Category Page Details
export const categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body

    // Selected category with published courses
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec()

    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    if (selectedCategory.courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category",
      })
    }

    // Get random different category
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    })

    const randomCategory =
      categoriesExceptSelected[
        getRandomInt(categoriesExceptSelected.length)
      ]

    const differentCategory = await Category.findById(randomCategory._id)
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec()

    // Top selling courses
    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec()

    const allCourses = allCategories.flatMap(
      (category) => category.courses
    )

    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10)

    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}
