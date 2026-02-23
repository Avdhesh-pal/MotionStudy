import express from "express"
const router = express.Router()

// Controller
import { contactUsController } from "../controllers/ContactUs.js"

// Route
router.post("/contact", contactUsController)

// Export router
export default router
