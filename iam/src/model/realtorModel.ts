import { Schema } from "mongoose";
import IAM from "./iamModel";
import RealtorInterface from "../interface/realtorInterface";

const RealtorSchema: Schema<RealtorInterface> = new Schema({
  status: {
    type: String,
    enum: ["in_waiting", "available"],
    default: "in_waiting",
    required: true,
  },
  assignedTours: [
    {
      tourId: {
        type: String,
        trim: true,
        required: false,
      },
    },
  ],
  security: [
    {
      identityType: {
        type: String,
        enum: ["driver-license", "passport", "other"],
        required: false,
      },
      identityNo: {
        type: String,
        required: false,
      },
      identityDoc: {
        type: String,
        required: false,
      },
    },
  ],
});

const Realtor = IAM.discriminator<RealtorInterface>("Realtor", RealtorSchema);

export default Realtor;
