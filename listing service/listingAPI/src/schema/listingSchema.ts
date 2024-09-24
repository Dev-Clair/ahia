import mongoose, { Schema } from "mongoose";
import slugify from "slugify";
import IListing from "../interface/IListing";
import AssetSchema from "./assetSchema";

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
    asset: {
      type: [AssetSchema],
      required: false,
    },
    category: {
      type: String,
      enum: ["residential", "commercial", "mixed"],
      set: (value: string) => value.toLowerCase(),
      required: true,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      countyLGA: {
        type: String,
        required: true,
      },
      city: {
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
      geoCoordinates: {
        type: [Number],
        validate: {
          validator: function (value: number[]) {
            return Array.isArray(value) && value.length === 2;
          },
          message: "geoCoodinates must be an array of two numbers",
        },
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
  location: "2dsphere",
});

// Listing Schema Middleware
ListingSchema.pre("save", function (next) {
  if (this.isNew) {
    if (this.asset.length === 0) {
      this.asset = [{ assetType: "land" }, { assetType: "property" }];
    }
  }

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
      await mongoose.model("Offering").bulkWrite(
        [
          {
            deleteMany: { filter: { listing: listing._id } },
          },
        ],
        { session }
      );

      // Drop all promotion references to listing
      await mongoose
        .model("Promotion")
        .findOneAndUpdate(
          { id: listing.promotion },
          { $pull: { listings: listing._id } },
          { new: false, session }
        );
    });

    next();
  } catch (err: any) {
    next(err);
  }
});

export default ListingSchema;
