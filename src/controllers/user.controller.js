import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})                                 // validateBeforeSave is used in conditions where validation part is not necesarry ,so that gets ignored and saving occurs smoothly

        return {accessToken, refreshToken}

    }catch(error){
        console.log(error)
        throw new ApiError(500,"cannot generate user access and refresh tokens")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // res.status(200).json({
    //     message:"OK"
    // })

    const {username, email, fullName, password} = req.body
    // console.log(email)

    //validation part 
    if(
        [fullName, email, username, password].some((field) =>           // some is used on arrays, if any of those fields is empty, error
        field?.trim() === "")
    ){
        throw new ApiError(400,"fill the compulsory fields")
    }

    const existedUser = await User.findOne({
        $or: [{username},{email}]                                       // or operator used
    })
    if(existedUser){
        throw new ApiError(409, "username or email already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path                  // "?" is optional chaining operator which will give undefined as output if content before ? is not available
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
    if(!avatarLocalPath){
        throw new ApiError(400, "avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(           // ajib syntax there is nothing we can do : we dont want user details password and refreshtoken to be reciprocated, so "-" will ignore those
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "error while registering user")
    }

    const response = res.status(201).json(
        new ApiResponse(200, createdUser, "created user succesfully")
    )
    return response
})

const loginUser = asyncHandler( async (req, res) => {

    const {email, username, password} = req.body

    if(!(username || email)){
        throw new ApiError(400, "username or email is required for login")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(400,"does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"invalid credentials")
    }

    console.log(user._id); // useless console in case i forget abt it 


    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,                                            // cookies be available only through http
        secure : true                                               // cookies be shared only via https    
    }
    console.log(accessToken);
    return res
    .status(200).
    cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser, accessToken , refreshToken
            },
            "user logged in succesfully"
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out succesfully"))
})

const refreshAccessToken = asyncHandler(async(req,res) =>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "unautohrized request");
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?._id);

    if(!user){
        throw new ApiError(401, "invalid refresh token");
    }

    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"refresh token expired or used");
    }

    try{
        const options ={
            httpOnly:true,
            secure:true
        }
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken, options)
        .cookie("refreshToken",newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
                "access token refreshed succesfully"
            )
        )
    }catch(error){
        throw new ApiError(401,error?.message || "invalid refresh token");
    }
})

export {
    registerUser, 
    loginUser,
    logoutUser,
    refreshAccessToken
}