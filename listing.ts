const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ListingSchema = new Schema({
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
    enum: ["Rent", "Sell"],
    required: true,
  },
  listingType: {
    type: String,
    enum: ["Developed", "Undeveloped"],
    required: true,
  },
  listingUseType: {
    type: String,
    enum: [
      "single-room",
      "mini-flat",
      "flats",
      "duplex",
      "semi-detached",
      "short-lets",
      "office",
      "shop",
      "event halls",
      "bare-land",
    ],
    required: true,
  },
  listingFeatures: [
    {
      type: String,
      enum: [
        "water",
        "power",
        "access roads",
        "security",
        "proximity to landmark and essential services",
      ],
    },
  ],
  listingLocation: {
    address: {
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
  listingUseCategory: {
    type: String,
    enum: ["Residential", "Commercial"],
    required: true,
  },
  listingImage: {
    type: String,
  },
  listingVideo: {
    type: String,
  },
  listingProvider: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Listing", ListingSchema);
