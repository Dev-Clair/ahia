import { Schema } from "mongoose";
import Config from "../../config";
import OfferingInterface from "../interface/offeringInterface";

const baseStoragePath = `https://s3.amazonaws.com/${Config.AWS.S3_BUCKET_NAME}`;

const OfferingSchema: Schema<OfferingInterface> = new Schema({
  type: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  features: [
    {
      type: String,
      required: true,
    },
  ],
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open",
  },
  media: {
    picture: {
      type: [String],
      get: (value: string) => `${baseStoragePath}${value}`,
      required: false,
    },
    video: {
      type: [String],
      get: (value: string) => `${baseStoragePath}${value}`,
      required: false,
    },
  },
});

export default OfferingSchema;
