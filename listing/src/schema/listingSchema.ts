import { Schema } from "mongoose";
import ListingInterface from "../interface/listingInterface";

const ListingSchema: Schema<ListingInterface> = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  purpose: {
    type: String,
    enum: ["rent", "sell"],
    required: true,
  },
  type: {
    type: String,
    enum: ["developed", "undeveloped"],
    required: true,
  },
  use: {
    type: {
      type: String,
      enum: [
        "single-room",
        "mini-flat",
        "2-bedroom-flat",
        "3-bedroom-flat",
        "duplex",
        "semi-detached",
        "short-lets",
        "office",
        "shop",
        "event-halls",
        "bare-land",
      ],
      required: true,
    },
    category: {
      type: String,
      enum: ["residential", "commercial"],
      required: true,
    },
  },
  features: [
    {
      type: String,
      required: true,
    },
  ],
  address: {
    street: {
      type: String,
      required: true,
    },
    zone: {
      type: String,
      required: true,
    },
    countyLGA: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: false,
    },
    coordinates: {
      type: Number,
      required: false,
    },
  },
  offering: [
    {
      type: Schema.Types.ObjectId,
      required: true,
    },
  ],
  attachment: [
    {
      type: Schema.Types.ObjectId,
      required: true,
    },
  ],
  provider: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ListingSchema.index({ location: "2dsphere" });

export default ListingSchema;
