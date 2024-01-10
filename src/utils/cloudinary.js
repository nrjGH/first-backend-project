import {v2 as cloudinary} from 'cloudinary';
          
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

        console.log("file has been uploaded succesfully", response.url);
        return response;
    }catch(error){
        fs.unlinkSync(localFilePath);                       // unlink removes the file from local temp file storage
        return null
    }
}

cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });

export {uploadOnCloudinary}