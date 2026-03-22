import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, Link } from "react-router-dom"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { requestResetOtp, resetPasswordWithOtp } from "../services/operations/authApi"

function ForgotPassword() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.auth)

  const [step, setStep] = useState("email") // "email" -> "otp" -> "reset"
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  // Handle Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault()

    if (!email) {
      alert("Please enter your email")
      return
    }

    const result = await dispatch(requestResetOtp(email))
    
    if (result) {
      setOtpSent(true)
      setStep("otp")
    }
  }

  // Handle Step 2 to Step 3: Verify OTP and Move to Password Reset
  const handleVerifyOtp = (e) => {
    e.preventDefault()

    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP")
      return
    }

    setStep("reset")
  }

  // Handle Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      alert("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long")
      return
    }

    await dispatch(resetPasswordWithOtp(email, otp, password, confirmPassword, navigate))
  }

  // Handle Back Button
  const handleBack = () => {
    if (step === "otp") {
      setStep("email")
      setOtp("")
    } else if (step === "reset") {
      setStep("otp")
      setPassword("")
      setConfirmPassword("")
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid place-items-center bg-richblack-900">
      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="w-full max-w-md mx-4 p-8 bg-richblack-800 rounded-lg shadow-lg">
          {/* Step 1: Email Entry */}
          {step === "email" && (
            <div>
              <h1 className="text-3xl font-semibold text-richblack-5 mb-4">
                Reset your password
              </h1>
              <p className="text-richblack-200 mb-6">
                Have no fear. We'll email you instructions to reset your password. 
                If you dont have access to your email we can try account recovery.
              </p>

              <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
                <label className="w-full">
                  <p className="mb-2 text-sm text-richblack-5">
                    Email Address <sup className="text-pink-200">*</sup>
                  </p>
                  <input
                    required
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="form-style w-full px-4 py-3 rounded-lg bg-richblack-700 text-richblack-5 border border-richblack-600 focus:outline-none focus:border-yellow-50"
                  />
                </label>

                <button
                  type="submit"
                  className="mt-4 rounded-lg bg-yellow-50 py-3 px-4 font-semibold text-richblack-900 hover:bg-yellow-100 transition-all duration-200"
                >
                  Reset Password
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login">
                  <button
                    type="button"
                    className="text-richblack-300 hover:text-richblack-5 transition-colors"
                  >
                    Back to Login
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <div>
              <h1 className="text-3xl font-semibold text-richblack-5 mb-4">
                Verify OTP
              </h1>
              <p className="text-richblack-200 mb-6">
                We have sent a 6-digit OTP to your email. Please enter it below.
              </p>

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <label className="w-full">
                  <p className="mb-2 text-sm text-richblack-5">
                    6-Digit OTP <sup className="text-pink-200">*</sup>
                  </p>
                  <input
                    required
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="form-style w-full px-4 py-3 rounded-lg bg-richblack-700 text-richblack-5 border border-richblack-600 focus:outline-none focus:border-yellow-50 text-center text-2xl tracking-widest"
                  />
                </label>

                <p className="text-xs text-richblack-300 mt-2">
                  The OTP will expire in 10 minutes
                </p>

                <button
                  type="submit"
                  className="mt-4 rounded-lg bg-yellow-50 py-3 px-4 font-semibold text-richblack-900 hover:bg-yellow-100 transition-all duration-200"
                >
                  Verify OTP
                </button>
              </form>

              <button
                type="button"
                onClick={handleBack}
                className="mt-6 w-full text-richblack-300 hover:text-richblack-5 transition-colors font-medium"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step 3: Password Reset */}
          {step === "reset" && (
            <div>
              <h1 className="text-3xl font-semibold text-richblack-5 mb-4">
                Choose new password
              </h1>
              <p className="text-richblack-200 mb-6">
                Almost done. Enter your new password and you're all set.
              </p>

              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                <label className="relative">
                  <p className="mb-2 text-sm text-richblack-5">
                    New Password <sup className="text-pink-200">*</sup>
                  </p>
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="form-style w-full px-4 py-3 rounded-lg bg-richblack-700 text-richblack-5 border border-richblack-600 focus:outline-none focus:border-yellow-50 !pr-10"
                  />
                  <span
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-[38px] z-10 cursor-pointer"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
                    ) : (
                      <AiOutlineEye fontSize={24} fill="#AFB2BF" />
                    )}
                  </span>
                </label>

                <label className="relative">
                  <p className="mb-2 text-sm text-richblack-5">
                    Confirm Password <sup className="text-pink-200">*</sup>
                  </p>
                  <input
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="form-style w-full px-4 py-3 rounded-lg bg-richblack-700 text-richblack-5 border border-richblack-600 focus:outline-none focus:border-yellow-50 !pr-10"
                  />
                  <span
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-[38px] z-10 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
                    ) : (
                      <AiOutlineEye fontSize={24} fill="#AFB2BF" />
                    )}
                  </span>
                </label>

                <p className="text-xs text-richblack-300 mt-2">
                  Password must be at least 8 characters long
                </p>

                <button
                  type="submit"
                  className="mt-4 rounded-lg bg-yellow-50 py-3 px-4 font-semibold text-richblack-900 hover:bg-yellow-100 transition-all duration-200"
                >
                  Reset Password
                </button>
              </form>

              <button
                type="button"
                onClick={handleBack}
                className="mt-6 w-full text-richblack-300 hover:text-richblack-5 transition-colors font-medium"
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ForgotPassword
