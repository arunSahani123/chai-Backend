import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.models.js";

export const verifyJWT =asyncHandler(async (req, res, next) => {
    try
    {
        const token=req.cookies?.accessToken || req.headers?.Authorization?.replace("Bearer ", "");
    if(!token) {
        throw new ApiError(401, "Unauthorized: No token provided"); 
    }
    
   
        const decoded=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Unauthorized: User not found");
        }
        req.user = user; // Attach user info to request object
        next();
    }catch(error)    {
        console.error("JWT Verification Error:", error);
        throw new ApiError(401, "Unauthorized: Invalid token");
    }
    
})