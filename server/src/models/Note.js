import mongoose from "mongoose";
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  semester: { type: String, default: "" },
  description: { type: String, default: "" },
  resourceUrl: { type: String, required: true },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });
export default mongoose.model("Note", schema);
