import { Schema } from "mongoose";
import slugify from "slugify";
import IOffering from "../interface/IOffering";
import Listing from "../model/listingModel";

const baseStoragePath = `https://s3.amazonaws.com/ahia/listing/offerings`;

const OfferingSchema: Schema<IOffering> = new Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    required: false,
  },
  type: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  features: [
    {
      type: String,
      required: true,
    },
  ],
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open",
  },
  media: {
    picture: {
      type: [String],
      get: (values: string[]) =>
        values.map((value) => `${baseStoragePath}${value}`),
      required: true,
    },
    video: {
      type: [String],
      get: (values: string[]) =>
        values.map((value) => `${baseStoragePath}${value}`),
      required: true,
    },
  },
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
});

// Offering Schema Search Query Index
OfferingSchema.index({ name: "text", type: "text" });

// Offering Schema Middleware
OfferingSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      replacement: "-",
      lower: true,
      strict: true,
      trim: true,
    });
  }

  next();
});

OfferingSchema.pre("findOneAndDelete", async function (next) {
  const offering = await this.model.findOne(this.getFilter());

  if (offering) {
    const listing = await Listing.findOne({ _id: offering.listing });

    const offeringIndex = listing?.offerings.indexOf(offering._id) as number;

    listing?.offerings.splice(offeringIndex, 1);
  }

  next();
});

export default OfferingSchema;
