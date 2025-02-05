import mongoose from "mongoose"// importing mongoose from mongoose
import { DB_NAME } from "../constansts.js" // importing Dbname from constants file

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) // connection the database using mongoose
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`) // there are different databases for different things like production database, development database, testing database,this is specified with the host name that is why there is written connection.host
        // console.log(connectionInstance)
        // console.log("separation")
        // console.log(connectionInstance.connection)
        // console.log("separation")
        // console.log(connectionInstance.connection.host)

    }catch(error){
        console.log("MONGODB connection error", error)
        process.exit(1)// nodejs gives access to process that current program is running on, it is a reference of current process, please read it afterwords in the nodejs documentation
    }
}

export default connectDB