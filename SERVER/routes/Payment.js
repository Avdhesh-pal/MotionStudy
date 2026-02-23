import express from "express"
const router = express.Router()

// Controllers
import {
  capturePayment,
  verifyPayment,
  sendPaymentSuccessEmail,
} from "../controllers/payments.js"

// Middleware
import {
  auth,
  isStudent,
  isInstructor,
  isAdmin,
} from "../middlewares/auth.js"

// ********************************************************************************************************
//                                      Payment routes
// ********************************************************************************************************

router.post("/capturePayment", auth, isStudent, capturePayment)

router.post("/verifyPayment", auth, isStudent, verifyPayment)

router.post(
  "/sendPaymentSuccessEmail",
  auth,
  isStudent,
  sendPaymentSuccessEmail
)

// router.post("/verifySignature", verifySignature)

// Export router
export default router
