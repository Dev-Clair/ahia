import { Schema } from "mongoose";
import IRealtor from "../interface/IRealtor";

const RealtorSchema: Schema<IRealtor> = new Schema(
  {
    tour: {
      type: Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    realtor: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export default RealtorSchema;
