import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { VscDashboard, VscSignOut } from "react-icons/vsc"

import { logout } from "../../../services/operations/authApi"

function ProfileDropDown() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.profile)
  const [open, setOpen] = useState(false)

  console.log("ProfileDropDown user state:", user)
  console.log("Full profile state:", useSelector((state) => state.profile))

  if (!user) return null

  return (
    <div className="relative">
      <button
        type="button"
        className="rounded-full"
        onClick={() => setOpen((prev) => !prev)}
      >
        <img
          src={user.image}
          alt={`profile-${user.firstName}`}
          className="aspect-square w-[32px] rounded-full object-cover"
        />
      </button>

      {open && (
        <div className="absolute top-[118%] right-0 z-[1000] min-w-[180px] divide-y divide-richblack-700 overflow-hidden rounded-md border border-richblack-700 bg-richblack-800">
          <Link
            to="/dashboard/my-profile"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-x-2 px-3 py-2 text-sm text-richblack-100 hover:bg-richblack-700"
          >
            <VscDashboard className="text-lg" />
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              dispatch(logout(navigate))
            }}
            className="flex w-full items-center gap-x-2 px-3 py-2 text-sm text-richblack-100 hover:bg-richblack-700"
          >
            <VscSignOut className="text-lg" />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileDropDown
