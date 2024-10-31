import { Document, Schema } from "mongoose";

export default interface IDocument extends Document {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
