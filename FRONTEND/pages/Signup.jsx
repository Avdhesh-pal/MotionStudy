import { Link } from "react-router-dom"

function Signup() {
  return (
    <div className="mx-auto flex min-h-screen w-11/12 max-w-maxContent items-center justify-center text-white">
      <div className="rounded-lg border border-richblack-700 bg-richblack-800 p-8 text-center">
        <h1 className="text-3xl font-semibold">Signup Page</h1>
        <p className="mt-3 text-richblack-200">Your signup form will be added here.</p>
        <Link to="/" className="mt-6 inline-block rounded-md bg-yellow-50 px-6 py-2 font-semibold text-black">
          Go to Home
        </Link>
      </div>
    </div>
  )
}

export default Signup
