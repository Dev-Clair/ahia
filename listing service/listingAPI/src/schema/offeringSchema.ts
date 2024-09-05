import { Schema } from "mongoose";
import Config from "../../config";
import OfferingInterface from "../interface/offeringInterface";

const baseStoragePath = `https://s3.amazonaws.com/${Config.AWS.S3_BUCKET_NAME}`;

const OfferingSchema: Schema<OfferingInterface> = new Schema({
  type: {
    // "single-room-suite" | "mini-flat" | "2-bedroom-flat" | "3-bedroom-flat" | "duplex" | "semi-detached" | "short-lets" | "office" | "shop" | "beach-resort" | "event-halls" | "bare-land";
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
      required: false,
    },
  ],
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open",
  },
  media: {
    picture: {
      type: String,
      get: (value: string) => `${baseStoragePath}${value}`, // Review: Set min number of images that can exist for an offering
      required: false,
    },
    video: {
      type: String,
      get: (value: string) => `${baseStoragePath}${value}`, // Review: Set min number of videos that can exist for an offering
      required: false,
    },
  },
});

export default OfferingSchema;
