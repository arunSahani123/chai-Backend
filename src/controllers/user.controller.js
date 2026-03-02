import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";


const generateAccessAndRefreshTokens = async (userId) => {
    try{
      const user =  await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      return { accessToken, refreshToken };


    }catch(error) {
        console.error("Token Generation Error:", error);
        throw new ApiError(500, "Failed to generate tokens");
    }

}

const registerUser = asyncHandler(async (req, res) => {

  const { username, email, password, fullName } = req.body;

  console.log(username, email, password, fullName);

  // ✅ Check empty fields
  if (
    [fullName, email, username, password].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // ✅ Check existing user
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // ✅ Get file paths safely
  const profileImagePath = req.files?.avatar?.[0]?.path;
//   const coverImagePath = req.files?.coverImage?.[0]?.path;

let coverImagePath;

if (
  req.files &&
  Array.isArray(req.files.coverImage) &&
  req.files.coverImage.length > 0
) {
  coverImagePath = req.files.coverImage[0].path;
}

  console.log(profileImagePath);
  console.log(coverImagePath);

  

  if (!profileImagePath) {
    throw new ApiError(400, "Profile image is required");
  }

  // ✅ Upload images
  const profileImage = await uploadOnCloudinary(profileImagePath);
  const coverImage = coverImagePath
    ? await uploadOnCloudinary(coverImagePath)
    : null;

  if (!profileImage) {
    throw new ApiError(
      500,
      "Something went wrong while uploading profile image"
    );
  }

  // ✅ Create user
  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: profileImage.url,
    coverImage: coverImage?.url || ""
  });

  // ✅ Remove password before sending response
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if(!createdUser) {
    throw new ApiError(500, "User created but failed to retrieve");
  }

  return res.status(201).json(new ApiResponse(true, "User registered successfully", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Require (username OR email) AND password
  if ((!username && !email) || !password) {
    throw new ApiError(400, "Username or email and password are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }


  const {refreshToken, accessToken} = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  };

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(true, "User logged in successfully", {
      user: loggedInUser,
      accessToken,
      refreshToken
    }));
 
});


const logoutUser = asyncHandler(async (req, res) => {
        await User.findByIdAndUpdate(req.user._id, { refreshToken: null }, { new: true });
        const options = {
            httpOnly: true,
            secure: true
        };
        return res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new ApiResponse(true, "User logged out successfully"));
})
export { registerUser, loginUser, logoutUser };