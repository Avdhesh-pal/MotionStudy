import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null,
  loading: false,
}

const profileSlice = createSlice({
  name: "profile",
  initialState: initialState,
  reducers: {
    setUser(state, value) {
      console.log("setUser reducer called with payload:", value.payload)
      state.user = value.payload
      console.log("state.user after update:", state.user)
    },
    setLoading(state, value) {
      console.log("setLoading reducer called with payload:", value.payload)
      state.loading = value.payload
    },
  },
})

export const { setUser, setLoading } = profileSlice.actions

export default profileSlice.reducer
