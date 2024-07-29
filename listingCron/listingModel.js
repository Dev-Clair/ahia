const mongoose = require("mongoose");

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
    enum: ["rent", "sell"],
    required: true,
  },
  type: {
    type: String,
    enum: ["developed", "ongoing", "undeveloped"],
    required: true,
  },
  category: {
    type: String,
    enum: ["economy", "premium", "luxury"],
    required: true,
  },
  use: {
    type: {
      type: String, // "single-room" | "mini-flat" | "2-bedroom-flat" | "3-bedroom-flat" | "duplex" | "semi-detached" | "short-lets" | "office" | "shop" | "event-halls" | "bare-land";
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
      type: String, // landmark features
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
  promotion: [
    {
      type: Schema.Types.ObjectId,
      ref: "Promotion",
      required: false,
    },
  ],
  attachment: [
    {
      type: Schema.Types.ObjectId,
      ref: "Attachment",
      required: false,
    },
  ],
  provider: {
    id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  reference: {
    id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    expiry: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString();
      },
    },
  },
});

const Listing = mongoose.model("Listing", ListingSchema);

module.exports = Listing;
