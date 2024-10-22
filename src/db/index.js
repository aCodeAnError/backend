import mongoose from "mongoose"
import { DB_NAME } from "../constansts.js"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`)
        // console.log(connectionInstance)
        // console.log("separation")
        // console.log(connectionInstance.connection)
        // console.log("separation")
        // console.log(connectionInstance.connection.host)

    }catch(error){
        console.log("MONGODB connection error", error)
        process.exit(1)// nodejs gives access to process that current program is running on
    }
}

export default connectDB