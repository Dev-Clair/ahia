import mongoose, { ObjectId, Schema } from "mongoose";
import slugify from "slugify";
import IListing from "../interface/IListing";
import IOffering from "../interface/IOffering";
import IPromotion from "../interface/IPromotion";
import Listing from "../model/listingModel";
import Promotion from "../model/promotionModel";

const baseStoragePath = `https://s3.amazonaws.com/ahia/listing/offerings`;

const OfferingSchema: Schema<IOffering> = new Schema({
  offeringType: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    // unique: true,
    required: false,
  },
  unitsAvailable: {
    type: Number,
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
  features: {
    type: [String],
    required: true,
  },
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
OfferingSchema.index({
  offeringType: "text",
  "area.size": 1,
  "price.amount": 1,
  status: "text",
});

// Offering Schema Middleware
OfferingSchema.pre("save", function (next) {
  if (this.isModified("offeringType")) {
    this.slug = slugify(this.offeringType, {
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
    const offering = (await this.model.findOne(this.getFilter())) as IOffering;

    if (!offering) next();

    const session = await mongoose.startSession();

    session.withTransaction(async () => {
      // Unlink listing reference to offering
      const listing = (await Listing.findOne({ _id: offering.listing }).session(
        session
      )) as IListing;

      if (listing) {
        const listingOfferingIndex = listing.offerings.indexOf(
          offering._id as ObjectId
        ) as number;

        if (listingOfferingIndex > -1) {
          listing.offerings.splice(listingOfferingIndex, 1);

          await listing.save({ session });
        }
      }

      // Unlink promotion reference to offering
      const promotion = (await Promotion.findOne({
        id: offering.promotion,
      }).session(session)) as IPromotion;

      if (promotion) {
        const promotionOfferingIndex = promotion.offerings.indexOf(
          offering._id as ObjectId
        ) as number;

        if (promotionOfferingIndex > -1) {
          promotion.offerings.splice(promotionOfferingIndex, 1);

          await promotion.save({ session });
        }
      }
    });

    next();
  } catch (err: any) {
    next(err);
  }
});

export default OfferingSchema;
