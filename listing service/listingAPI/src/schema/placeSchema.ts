import { Schema } from "mongoose";
import IPlace from "../interface/IPlace";

const PlaceSchema: Schema<IPlace> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
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

// Place Schema Search Query Index
PlaceSchema.index({ name: "text", city: "text", state: "text" });

export default PlaceSchema;
