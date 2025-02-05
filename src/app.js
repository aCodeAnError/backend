import express from "express" //  importing express from express 
import cors from "cors" // importing cors from cors
import cookieParser from "cookie-parser" // importing cookie parser from cookie parser
const app = express() // making a app from express now the app has all the functionalities of the express which is a nodejs framework

app.use(cors({
    origin: process.env.CORS_ORIGIN, // kon kon sa origin allow kar rahe ho
    credentials: true, // know about it first then come here again
})) // cors configuration


// configuration of the coming data and files
app.use(express.json({limit: "21kb"}))// limit of the json data
app.use(express.urlencoded({extended : true, limit: "16kb"})) // object inside object allowed
app.use(express.static("public"))//public assets 
app.use(cookieParser()) //for accessing the user's browser cookies and set them


// routes import

import userRouter from "./routes/user.routes.js"


// routes declaration
app.use("/api/v1/users", userRouter)

// http://localhost:8000/api/v1/users/register

export { app } // exporting the app