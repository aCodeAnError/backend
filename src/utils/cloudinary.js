import {v2 as cloudinary} from "cloudinary"
import fs from "fs" // build in file system in nodejs

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePah, {
            resource_type: "auto"
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
