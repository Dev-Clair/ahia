import mongoose, { ObjectId, Schema } from "mongoose";
import slugify from "slugify";
import Listing from "../model/listingModel";
import IOffering from "../interface/IOffering";
import OfferingInterface from "../interface/offeringInterface";
import OfferingInterfaceType from "../type/offeringinterfaceType";

const baseStoragePath = `https://s3.amazonaws.com/ahia/listing/offerings`;

const OfferingSchema: Schema<
  IOffering,
  OfferingInterfaceType,
  OfferingInterface
> = new Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    required: false,
  },
  offeringType: {
    type: String,
    required: true,
  },
  area: {
    size: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      enum: ["sqm", "sqft"],
      required: true,
    },
  },
  price: {
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
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
    images: {
      type: [String],
      get: (values: string[]) =>
        values.map((value) => `${baseStoragePath}${value}`),
      default: undefined,
    },
    videos: {
      type: [String],
      get: (values: string[]) =>
        values.map((value) => `${baseStoragePath}${value}`),
      default: undefined,
    },
  },
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  promotion: {
    type: Schema.Types.ObjectId,
    ref: "Offering",
    required: false,
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
  try {
    const offering = (await this.model.findOne(
      this.getFilter()
    )) as OfferingInterface;

    if (!offering) next();

    const session = await mongoose.startSession();

    session.withTransaction(async () => {
      const listing = await Listing.findOne({ _id: offering.listing }).session(
        session
      );

      if (!listing) next();

      const offeringIndex = listing?.offerings.indexOf(
        offering._id as ObjectId
      ) as number;

      listing?.offerings.splice(offeringIndex, 1);

      await listing?.save({ session });
    });
  } catch (err: any) {
    next(err);
  }

  next();
});

export default OfferingSchema;
