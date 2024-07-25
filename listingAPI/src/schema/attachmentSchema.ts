import { Schema } from "mongoose";
import AttachmentInterface from "../interface/attachmentInterface";

const AttachmentSchema: Schema<AttachmentInterface> = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  type: {
    type: String,
    trim: true,
    enum: ["audio", "video", "picture", "document"],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default AttachmentSchema;
