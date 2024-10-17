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
      required: true,
      validate: {
        validator: (value: string) => /^[0-9a-fA-F]{24}$/.test(value),
        message: "Invalid ID Format",
      },
    },
  },
  { timestamps: true }
);

export default RealtorSchema;
