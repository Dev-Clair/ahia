import { Document, Schema } from "mongoose";

export default interface IRealtor extends Document {
  _id: Schema.Types.ObjectId;
  id: () => string;
  tour: Schema.Types.ObjectId;
  realtor: string;
}
