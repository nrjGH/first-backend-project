import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null;                     // local path of file not found
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type:"auto"
        })

        // console.log("file has been uploaded succesfully", response.url);
        fs.unlinkSync(localFilePath)
        return response;
    }catch(error){
        fs.unlinkSync(localFilePath);                       // unlink removes the file from local temp file storage
        return null
    }
}

export {uploadOnCloudinary}