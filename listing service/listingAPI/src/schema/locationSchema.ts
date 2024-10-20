import { Schema } from "mongoose";
import ILocation from "../interface/ILocation";

const LocationSchema: Schema<ILocation> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    coordinates: {
      lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Location Schema Search Query Index
LocationSchema.index({ name: "text", coordinates: "2dsphere" });

export default LocationSchema;
