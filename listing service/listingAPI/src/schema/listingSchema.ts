import mongoose, { Schema } from "mongoose";
import IListing from "../interface/IListing";
import OfferingSchema from "./offeringSchema";

const baseStoragePath = `https://s3.amazonaws.com/ahia/listing`;

const ListingSchema: Schema<IListing> = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["land", "property"],
      required: true,
    },
    offerings: [
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
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zip: {
        type: String,
        required: false,
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
        validate: {
          validator: function (value: [number, number]) {
            return Array.isArray(value) && value.length === 2;
          },
          message: "coordinates must be an array of two numbers",
        },
        required: false,
      },
    },
    provider: {
      id: {
        type: String,
        required: true,
      },
      slug: {
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
  },
  { timestamps: true }
);

// Listing Schema Search Query Index
ListingSchema.index({
  type: "text",
  location: "2dsphere",
});

ListingSchema.pre("findOneAndDelete", async function (next) {
  try {
    const listing = (await this.model.findOne(this.getFilter())) as IListing;

    if (!listing) next();

    const session = await mongoose.startSession();

    session.withTransaction(async () => {
      // Delete all offering document records referenced to listing
      await mongoose.model("Offering", OfferingSchema).bulkWrite(
        [
          {
            deleteMany: { filter: { listing: listing._id } },
          },
        ],
        { session }
      );
    });

    next();
  } catch (err: any) {
    next(err);
  }
});

export default ListingSchema;
