import { Schema } from "mongoose";
import RealtorCacheInterface from "../interface/realtorCache";

const RealtorCacheSchema: Schema<RealtorCacheInterface> = new Schema({
  tourId: {
    type: String,
    required: true,
  },
  realtor: {
    id: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default RealtorCacheSchema;
