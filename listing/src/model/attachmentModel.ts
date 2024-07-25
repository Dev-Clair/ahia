import mongoose from "mongoose";
import AttachmentSchema from "../schema/attachmentSchema";
import AttachmentInterface from "../interface/attachmentInterface";

const Attachment = mongoose.model<AttachmentInterface>(
  "Attachment",
  AttachmentSchema
);

export default Attachment;
