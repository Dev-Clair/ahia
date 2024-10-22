import { Document, Schema } from "mongoose";

export default interface IDocument extends Document {
  _id: Schema.Types.ObjectId;
  id: () => string;
}
