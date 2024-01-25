import mongoose,{Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,              // trims off the spaces before or after
        index:true              // it is better to add index to the entities which will be searched a lot in the database
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        index:true
    },
    avatar:{
        type:String,             //cloudinary url
        required:true
    },
    coverImage:{
        type:String
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,'Password is required']    
    },
    refreshToken:{
        type:String
    },
    

},{timestamps:true})

userSchema.pre("save",async function (next){            // pre hooks are used to run any code executions just before saving
    if(! this.isModified("password")) return next();    // only if "passsword" field is modified, we want the pre hook to work, else we can straight away call the next()
    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (passsword){
    return await bcrypt.compare(passsword,this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY,
        }
    )
}
userSchema.methods.generateRefreshToken = function(){                           // if you dont return no access and refresh token they wont be generated duh
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY,
        }
    )
}

export const User = mongoose.model("User",userSchema)