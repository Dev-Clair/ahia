import { Schema } from "mongoose";
import slugify from "slugify";
import ListingInterface from "../interface/listingInterface";
import ListingMethodInterface from "../interface/listingmethodInterface";
import ListingModel from "../type/listingmethodType";
import OfferingInterface from "../interface/offeringInterface";

const ListingSchema: Schema<
  ListingInterface,
  ListingModel,
  ListingMethodInterface
> = new Schema(
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
    verify: {
      status: {
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

// Schema Search Query Index
ListingSchema.index({
  name: "text",
  description: "text",
  slug: "text",
  type: "text",
  category: "text",
  location: "2dsphere",
});

// Middleware
ListingSchema.pre("save", function (next) {
  if (!this.isModified("name")) {
    this.slug = slugify(this.name, {
      replacement: "-",
      lower: true,
      strict: true,
      trim: true,
    });
  }

  next();
});

// Schema Instance Method
ListingSchema.method("fetchOfferings", async function fetchOfferings(): Promise<
  OfferingInterface[]
> {
  const listing = this;

  await listing.populate("offering");

  return listing.offering;
});

export default ListingSchema;
