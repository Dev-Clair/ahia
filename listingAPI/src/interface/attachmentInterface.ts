import { Document } from "mongoose";

export default interface AttachmentInterface extends Document {
  name: string;
  type: "audio" | "video" | "picture" | "document" | "other";
  category: "listing" | "promotion";
  key: string;
}
