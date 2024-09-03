const mongoose = require("mongoose");

const ListingSchema = new Schema(
  {
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
    price: {
      type: Number,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["lease", "sell"],
      required: true,
    },
    type: {
      type: String,
      enum: ["on-going", "now-selling"],
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
        enum: ["residential", "commercial", "mixed"],
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
    status: {
      id: {
        type: String,
        required: true,
      },
      approved: {
        type: Boolean,
        enum: [true, false],
        default: false,
      },
      expiry: {
        type: Date,
        default: function () {
          return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString();
        },
      },
    },
  },
  { timestamps: true }
);

const Listing = mongoose.model("Listing", ListingSchema);

module.exports = Listing;
