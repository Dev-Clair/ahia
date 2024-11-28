import { Schema } from "mongoose";
import IPlace from "../interface/IPlace";

const PlaceSchema: Schema<IPlace> = new Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    coordinates: {
      lat: {
        type: Number,
        required: false,
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        required: false,
        min: -180,
        max: 180,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Place Schema Search Query Index
PlaceSchema.index({ city: "text", state: "text" });

export default PlaceSchema;
