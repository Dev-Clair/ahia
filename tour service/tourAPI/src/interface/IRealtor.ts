import { Document, Schema } from "mongoose";

export default interface IRealtor extends Document {
  tour: Schema.Types.ObjectId;
  realtor: string;
}
