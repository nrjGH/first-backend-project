import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"}))                       //to ensure json packages do not exceed 16kb
app.use(express.urlencoded({extended:true, limit:"16kb"}))  //to ensure URL be accepted in various forms
app.use(express.static("public"))                           //to store static data
app.use(cookieParser())                                     //cookieparser helps execute crud operations on cookies in user's browser 


//routes
import userRouter from "./routes/user.route.js"
app.use("/api/v1/users",userRouter)

import router from "./routes/video.route.js"
app.use("/api/v1/videos", router)

import playlistRouter from "./routes/playlist.route.js"
app.use("/api/v1/playlists", playlistRouter)

export {app}


