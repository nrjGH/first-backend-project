import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import { Video } from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {           // create playlist
    const {name, description} = req.body

    if(!name){
        throw new ApiError(400, "name is required")
    }

    if(!description){
        throw new ApiError(400, "description is required")
    }

    const userId = req.user?._id


    const newPlaylist = await Playlist.create({
        name,
        description,
        owner : userId
    })

    if(!newPlaylist){
        throw new ApiError(400,"failed to create a playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, newPlaylist, "succesfully created a playlist")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {         // get user playlists
    const {userId} = req.params
    var playlists;
    try{
        playlists = await Playlist.find({owner:userId})

        if(playlists.length === 0){
            return res
            .status(200)
            .json(new ApiResponse(200,[],"user has zero playlists"))
        }
    
        return res.status(200)
        .json(new ApiResponse(200, playlists, "succesfully fetched all playlists"))

    }catch(error){
        console.log(error)
        throw new ApiError(400,"error extracting playlists")
    }

})

const getPlaylistById = asyncHandler(async (req, res) => {          // get playlist by id
    const {playlistId} = req.params
    
    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"playlist does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "succesfully fetched the playlist")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {       // add video to playlist
    const {playlistId, videoId} = req.params

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404,"playlist does not exist")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"mentioned video does not exist")
    }

    try{
        const addVideo = await Playlist.findByIdAndUpdate(
            playlistId,
            { $push: {
                videos: videoId
            }},
            {new : true}
        )
        
        if(!addVideo){
            throw new ApiError(404,"add operation failed")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200, addVideo, "added video succesfully in the playlist")
        )
    }catch(error){
        console.log(error)
        throw new ApiError(500,"unable to add video in playlist")
    }

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {  // remove video from playlist
    const {playlistId, videoId} = req.params

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "mentioned playlist does not exist ")
    }

    const video =  await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"mentioned video not found")
    }
    try{
        const result = await Playlist.findByIdAndUpdate(
            {_id:playlistId},
            {
                $pull:{
                    videos:videoId
                }
            },
            {
                new:true
            },   
        )    
        
        return res
        .status(200)
        .json(
            new ApiResponse(200,result, "video removed from playlist succesfully")
        )
    }catch(error){
        console.log(error)
        throw new ApiError(401,"failed to delete video from playlist")
    }
})

const deletePlaylist = asyncHandler(async (req, res) => {           // delete playlist
    const {playlistId} = req.params
    
    try{
        const result = await Playlist.findByIdAndDelete({_id:playlistId})

        if(!result){
            throw new ApiError(401,"failed to delete playlist")
        }

        return res.status(200).json(new ApiResponse(200,result, "playlist deleted succesfully"))

    }catch(error){
        console.log(error)
        throw new ApiError(401,error,"error occured while deleting playlist")
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {           // update playlist
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if(!name && !description){
        throw new ApiError(404, " name and descroption is required")
    }

    try{
        const playlist = await Playlist.findByIdAndUpdate(playlistId,
            {
                $set:{
                    name: name,
                    description: description
                }
            },
            {new:true}
        )

        return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "updated the changes sucesfully")
        )
    }catch(error){
        console.log(error)
        throw new ApiError(500,error,"error updating the data of playlist")
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}