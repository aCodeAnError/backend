import mongoose, {Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2" //helps to write aggregation queries,used as a plugin

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // cloudinary url
            required: true,

        },

        thumbnail: {
            type : String,
            required: true
        },

        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        duration: {
            type: Number,
            required: true
        },

        views: {
            type: Number,
            default: 0,
        },

        isPublished: {
            type: Boolean,
            default: true,
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        }
    },
    { timestamps : true}
)

videoSchema.plugin(mongooseAggregatePaginate) // now we can write aggregation queries we added aggregate as a plugin in the videoSchema

export const Video = mongoose.model("Video", videoSchema)