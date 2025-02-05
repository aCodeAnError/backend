import {v2 as cloudinary} from "cloudinary" // importing v2 as cloudinary from cloudinary
import fs from "fs" // build in file system in nodejs, this is a library

// cloudinary configuration 
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null // if the localfilepath is not in our database then return
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // this parameter is to detect what type of file is coming eg png jpg 
        })
        // file has been uploaded successfully
        // console.log("file is uploaded on cloudinary ", response.url)
        fs.inlinkSync(localFilePath)
        return response

    }catch(error){
        fs.unlikSync(localFilePath) // remove the locally save temporary file as the upload opration got failed
        return  null;
    }
}

export {uploadOnCloudinary}
