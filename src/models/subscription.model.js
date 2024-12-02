import mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // the video creator
        ref: "User"
    }
}, {timestapms: true})


export const Subscription = mongoose.model("Subscription", subscriptionSchema)
