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
        validator: (value: string) =>
          /^[0-9a-fA-F]{24}$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
            value
          ),
        message: "Invalid ID (must be either an ObjectId or a UUID)",
      },
    },
  },
  { timestamps: true }
);

export default RealtorSchema;
