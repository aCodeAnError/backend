import { asyncHandler} from "../utils/asynchandler.js" // importing asynchandler
import {ApiError} from "../utils/ApiError.js" // importing apiError
import { User} from "../models/user.model.js" // importing User
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefershTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken // storing the refersh token in the database
        await user.save({validateBeforeSave: false}) 

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Refresh and Access Token")
    }
}

const registerUser =  asyncHandler( async (req, res) => {
    // name
    // email
    // password
    // cover image
    // image
    // check if the user exist
    // if yes then send error
    // if no then create new user//

    // get user details from frontend
    // validation - not empty
    // check if user already exist: username, email
    // check for images, check for avatar
    // upload to them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for the user creation
    // return response


    const {fullname, email, username, password} = req.body // getting user details from req.body

    console.log("email: ", email)

    if(
        [fullname, email, username, password].some( (field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    } // checking if some of the entries are empty or not


    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    }) // cheking if user exist or not

    if(existedUser){
        throw new ApiError(409, "User with email or username already exits")
    } // if the user exist then throw error user already exist 

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0]
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username and email
    // find User - if not found send error
    // password check
    // access and referesh token
    // send cookie

    const {email, username, password} = req.body // taking data from the req body

    if(!username && !email){
        throw new ApiError(400, "username or email is required")
    }
    
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Password incorrect")
    }

    const {accessToken, refreshToken } = await generateAccessAndRefershTokens(user._id)

    const loggedInUser = await User.findById(user._id).select(" -password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("acessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "user loggedIn successfully "
        )
    )
})

const logoutUser = asyncHandler( async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { 
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "anauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken ){
            throw new ApiError(401, "Refresh token is expired")
        }
    
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefershTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newrefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refreshToken")
    }

})

  
const changeCurrentPassword = asyncHandler(async (req,res) => {
    const {oldPassword, newPassword} = req.body
    
    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforSave: false})

    return res
    .status(200 )
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) =>{
    return res
    .status(200)
    .json( new ApiResponse(200, req.user, "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body

    if(!fullname || !email){
        throw new ApiError(400, "All feilds are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set : {
            fullname,
            email
          }  
        },
        {
            new: true,
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
})


const updateUserAvatar = asyncHandler( async (req, res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.uer?._id,
        {
            $set: {
                avatar: avatar.url,
            }
        },
        {
            new: true,
        }
    ).select("-password")

    
    return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar updated successfully"))

})

const updateUserCoverImage = asyncHandler( async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "cover image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading cover Image")
    }

    const user = await User.findByIdAndUpdate(
        req.uer?._id,
        {
            $set: {
                coverImage: coverImage.url,
            }
        },
        {
            new: true,
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image updated successfully"))

})

const getUserChannelProfile = asyncHandler( async (req, res) => {
    const {username} = req.params

    if(!username?.trim()){
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localFeild: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },

        {
            $lookup: {
                from: "subscriptions",
                localFeild: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond:{
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },

        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                avatar: 1,
                coverImage: 1,
                isSubscribed: 1,
                email: 1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404, "channel does not exist")
    }

    console.log("the channel: ",channel)

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "user channel fetched successfully")
    )

}) 


const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})




export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateAccountDetails,
    changeCurrentPassword,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
 }

// use hashnode