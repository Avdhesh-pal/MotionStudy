import express from "express"
const app = express()

// Import routes
import userRoutes from "./routes/User.js"
import courseRoutes from "./routes/Course.js"
import paymentRoutes from "./routes/Payment.js"
import contactUsRoutes from "./routes/Contact.js"
import profileRoutes from "./routes/Profile.js"

// import config
import dotenv from "dotenv"
dotenv.config()
const PORT = process.env.PORT || 4000
import { databaseConnect } from "./config/database.js";

const {cloudinaryConnect} = await import("./config/cloudinary.js")
import fileUpload from "express-fileupload"

// Connect to database
databaseConnect();
// Middleware
import cookieParser from "cookie-parser"
import cors from "cors"

// Use middleware
app.use(express.json())
app.use(cookieParser())
app.use(
    cors({
        origin:["http://localhost:3000", "http://localhost:5173"],
        credentials:true,
    })
)
app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp",
    })
)
cloudinaryConnect();
// Use routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoutes);

// def route
app.get("/",(req,res)=>{
    return res.status(200).json({
        success:true,
        message:"Your sever is running ",
    })
})

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}` )
})



