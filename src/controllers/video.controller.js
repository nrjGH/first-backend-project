import mongoose, {isValidObjectId} from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async(req,res) => {                           // get all videos based on query,sort,pagination
    const {page = 1, limit = 10, query, sortBy, sortType, userId} = req.query

})

const publishAVideo = asyncHandler(async(req,res) => {                          // get video, upload to cloudinary, create video 
    const {title, description} = req.body

    if(!title){
        throw new ApiError(400,"title is required")
    }

    if(!description){
        throw new ApiError(400,"description is required")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if(!videoLocalPath){
        throw new ApiError(400, "video not uploaded locally")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400, "thumbnail not uploaded locally")
    }

    const videoPath = await uploadOnCloudinary(videoLocalPath)
    const thumbnailPath = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoPath) {
        throw new ApiError(400,"video upload to cloudinary failed")
    }
    if(!thumbnailPath) {
        throw new ApiError(400,"thumbnail upload to cloudinary failed")
    }

    const video = await Video.create({
        videoFile : videoPath.url,
        thumbnail : thumbnailPath.url,
        title : title,
        description : description,
        duration: videoPath.duration   
    })

    const createdVideo = await Video.findById(video._id)

    if(!createdVideo){
        throw new ApiError(400,"error creating video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            createdVideo,
            "created video succesfully"
        )
    )

})

const getVideoById = asyncHandler(async (req, res) => {                         // get video by id
    const { videoId } = req.params
    
    const video = await Video.findById(videoId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,video,"video fetched succesfully"
        )
    )
})

const updateVideo = asyncHandler(async (req, res) => {                          // update video details like title, description, thumbnail
    const { videoId } = req.params

    const {title, description, thumbnail} = req.body

    const video = await Video.findByIdAndUpdate(videoId, 
        {
            $set:{
                title,
                description,
                thumbnail
            }
        },
        {new:true}  
    )

    return res
    .status(200)
    .json(
        new ApiError(200,video, "details updated succesfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {                          // delete video
    const { videoId } = req.params
    
    const result = await Video.deleteOne({_id:videoId})
    console.log(result)
    if(result.deletedCount === 1){
        return res
        .status(200)
        .json(
            new ApiResponse(200,"video deleted succesfully")
        )
    }
    else{
        throw new ApiError(401,"failed to delete")
    }
})

export {getAllVideos,
        publishAVideo,
        getVideoById,
        updateVideo,
        deleteVideo
}