import { Schema } from "mongoose";
import AttachmentInterface from "../interface/attachmentInterface";
import { nanoid } from "nanoid";

const AttachmentSchema: Schema<AttachmentInterface> = new Schema(
  {
    // listing: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Listing",
    //   required: true,
    // },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      trim: true,
      enum: ["audio", "video", "picture", "document", "other"],
      required: true,
    },
    category: {
      type: String,
      enum: ["listing", "promotion"],
      required: true,
    },
    key: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

AttachmentSchema.pre("save", function (next) {
  if (!this.isModified(this.name)) {
    this.name = `attachment_${nanoid()}`;
  }

  next();
});

export default AttachmentSchema;
