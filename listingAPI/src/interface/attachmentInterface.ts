import { Document, Schema } from "mongoose";

export default interface AttachmentInterface extends Document {
  listing: Schema.Types.ObjectId;
  type: "audio" | "video" | "picture" | "document";
  url: string;
  createdAt: Date;
}
