import mongoose, { ObjectId, Schema } from "mongoose";
import slugify from "slugify";
import Listing from "../model/listingModel";
import ListingInterface from "../interface/listingInterface";
import IOffering from "../interface/IOffering";
import OfferingInterface from "../interface/offeringInterface";
import OfferingInterfaceType from "../type/offeringinterfaceType";
import Promotion from "../model/promotionModel";
import PromotionInterface from "../interface/promotionInterface";

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
    images: [
      {
        type: String,
        get: (values: string[]) =>
          values.map((value) => `${baseStoragePath}${value}`),
        default: undefined,
      },
    ],
    videos: [
      {
        type: String,
        get: (values: string[]) =>
          values.map((value) => `${baseStoragePath}${value}`),
        default: undefined,
      },
    ],
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
OfferingSchema.index({
  name: "text",
  offeringType: "text",
  "area.size": 1,
  "price.amount": 1,
});

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
      // Drop listing reference to offering
      const listing = (await Listing.findOne({ _id: offering.listing }).session(
        session
      )) as ListingInterface;

      if (!listing) next();

      const listingOfferingIndex = listing?.offerings.indexOf(
        offering._id as ObjectId
      ) as number;

      if (listingOfferingIndex > -1) {
        listing?.offerings.splice(listingOfferingIndex, 1);

        await listing?.save({ session });
      }

      // Drop promotion reference to offering
      const promotion = (await Promotion.findOne({
        id: offering.promotion,
      }).session(session)) as PromotionInterface;

      if (!promotion) next();

      const promotionOfferingIndex = promotion?.offerings.indexOf(
        offering._id as ObjectId
      ) as number;

      if (promotionOfferingIndex > -1) {
        promotion?.offerings.splice(promotionOfferingIndex, 1);

        await promotion?.save({ session });
      }
    });
  } catch (err: any) {
    next(err);
  }

  next();
});

export default OfferingSchema;
