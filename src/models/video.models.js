import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String, // cloudinary URL or path
      required: true,
    },
    thumbnail: {
      type: String, // cloudinary URL
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User", // referencing users collection
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number, // in seconds
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);
videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model("Video", videoSchema);