import mongoose, { Schema } from "mongoose";
import IListing from "../interface/IListing";
import ProductSchema from "./productSchema";

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
      enum: ["land", "mobile", "property"],
      required: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
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
          message: "coordinates must be an array tuple of two numbers",
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
      images: {
        type: [String],
        get: (values: string[]) =>
          values.map((value) => `${baseStoragePath}${value}`),
        required: [true, "Kindly add an image for this product"],
      },
      videos: {
        type: [String],
        get: (values: string[]) =>
          values.map((value) => `${baseStoragePath}${value}`),
        required: false,
      },
    },
  },
  { timestamps: true }
);

// Listing Schema Search Query Index
ListingSchema.index({
  location: "2dsphere",
  "provider.id": "text",
  "provider.slug": "text",
  type: "text",
});

// Listing Schema Middleware
ListingSchema.pre("findOneAndDelete", async function (next) {
  const session = await mongoose.startSession();

  try {
    const listing = (await this.model
      .findOne(this.getFilter())
      .session(session)) as IListing;

    if (!listing) next();

    await session.withTransaction(async () => {
      // Delete all product document records referenced to listing
      await mongoose.model("Product", ProductSchema).bulkWrite(
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
  } finally {
    await session.endSession();
  }
});

export default ListingSchema;
