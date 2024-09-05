import { Schema } from "mongoose";
import slugify from "slugify";
import ListingInterface from "../interface/listingInterface";

const ListingSchema: Schema<ListingInterface> = new Schema(
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
    purpose: {
      type: String,
      enum: ["lease", "sell", "reservation"],
      required: true,
    },
    type: {
      type: String,
      enum: ["economy", "premium", "luxury"],
      required: true,
    },
    category: {
      type: String,
      enum: ["residential", "commercial", "mixed"],
      required: true,
    },
    offering: [
      {
        type: Schema.Types.ObjectId,
        ref: "Offering",
        required: false,
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
        default: "Point",
        required: false,
      },
      coordinates: {
        type: [Number],
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
  { timestamps: true, discriminatorKey: "purpose" }
);

ListingSchema.index({
  name: "text",
  description: "text",
  slug: "text",
  type: "text",
  category: "text",
  // "offering.id": 1,
  location: "2dsphere",
});

ListingSchema.pre("save", function (next) {
  if (!this.isModified("slug")) {
    this.slug = slugify(this.name, {
      replacement: "-",
      lower: true,
      strict: true,
      trim: true,
    });
  }

  next();
});

export default ListingSchema;
