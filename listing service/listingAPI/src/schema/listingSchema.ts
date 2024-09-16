import mongoose, { ObjectId, Schema } from "mongoose";
import slugify from "slugify";
import IListing from "../interface/IListing";
import IPromotion from "../interface/IPromotion";
import Offering from "../model/offeringModel";
import Promotion from "../model/promotionModel";

const baseStoragePath = `https://s3.amazonaws.com/ahia/listing`;

const ListingSchema: Schema<IListing> = new Schema(
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
      // unique: true,
      required: false,
    },
    listingType: {
      type: String,
      enum: ["lease", "sell", "reservation"],
      required: true,
    },
    propertyType: {
      type: String,
      enum: ["economy", "premium", "luxury"],
      set: (value: string) => value.toLowerCase(),
      required: true,
    },
    propertyCategory: {
      type: String,
      enum: ["residential", "commercial", "mixed"],
      set: (value: string) => value.toLowerCase(),
      required: true,
    },
    offerings: {
      type: [Schema.Types.ObjectId],
      ref: "Offering",
      default: [],
    },
    address: {
      type: String,
      required: true,
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
    media: {
      image: {
        type: String,
        get: (value: string) => `${baseStoragePath}${value}`,
        required: false,
      },
      video: {
        type: String,
        get: (value: string) => `${baseStoragePath}${value}`,
        required: false,
      },
    },
    verification: {
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
    featured: {
      status: {
        type: Boolean,
        enum: [true, false],
        default: false,
      },
      type: {
        type: String,
        enum: ["basic", "plus", "prime"],
        default: "basic",
      },
    },
    promotion: {
      type: Schema.Types.ObjectId,
      ref: "Promotion",
      required: false,
    },
  },
  { timestamps: true, discriminatorKey: "listingType" }
);

// Listing Schema Search Query Index
ListingSchema.index({
  name: "text",
  description: "text",
  offerings: 1,
  location: "2dsphere",
});

// Listing Schema Middleware
ListingSchema.pre("save", function (next) {
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

ListingSchema.pre("findOneAndDelete", async function (next) {
  try {
    const listing = (await this.model.findOne(this.getFilter())) as IListing;

    if (!listing) next();

    const session = await mongoose.startSession();

    session.withTransaction(async () => {
      // Delete all offering document records referenced to listing
      await Offering.deleteMany({ listing: listing._id }).session(session);

      // Drop all promotion references to listing
      const promotion = (await Promotion.findOne({
        id: listing.promotion,
      }).session(session)) as IPromotion;

      if (promotion) {
        const listingIndex = promotion?.listings.indexOf(
          listing._id as ObjectId
        ) as number;

        if (listingIndex > -1) {
          promotion.listings.splice(listingIndex, 1);

          await promotion.save({ session });
        }
      }
    });

    next();
  } catch (err: any) {
    next(err);
  }
});

export default ListingSchema;
