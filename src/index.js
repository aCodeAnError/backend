// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import {app} from "./app.js"


dotenv.config({
    path: './.env'
})


// connectDb is an asyncronous method that returns a promise so after calling this method we require to do some checks using .then and .catch to consume the promise
connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("errr:",error)
        throw error
    }) // listing for an event error and printing it just to be save

    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server is running at port : ${process.env.PORT}`);
    }) // using app to listem on the port 
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})

