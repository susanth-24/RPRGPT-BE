import mongoose from "mongoose";

const fileSchema = mongoose.Schema({
    filename: { type: String, required: true },
    S3url: { type: String, required: true },
    id: { type: String },
})

export default mongoose.model("File", fileSchema);