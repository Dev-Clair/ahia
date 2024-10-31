import mongoose, { Schema } from "mongoose";
import IProduct from "../interface/IProduct";
import ListingSchema from "./listingSchema";
import OfferingSchema from "./offeringSchema";

const baseStoragePath = `https://s3.amazonaws.com/ahia/listing/products`;

const ProductSchema: Schema<IProduct> = new Schema(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    offering: {
      type: OfferingSchema,
      required: true,
    },
    type: {
      type: String,
      enum: ["lease", "reservation", "sell"],
      required: true,
    },
    media: {
      images: {
        type: [String],
        get: (values: string[]) =>
          values.map((value) => `${baseStoragePath}${value}`),
        required: false,
      },
      videos: {
        type: [String],
        get: (values: string[]) =>
          values.map((value) => `${baseStoragePath}${value}`),
        required: false,
      },
    },
    promotion: {
      type: String,
      enum: ["platinum", "gold", "ruby", "silver"],
      default: "silver",
    },
    verification: {
      status: {
        type: Boolean,
        enum: [true, false],
        default: false,
      },
      expiry: {
        type: Date,
        default: () =>
          new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString(),
      },
    },
  },
  {
    discriminatorKey: "type",
    timestamps: true,
  }
);

// Product Schema Search Query Index
ProductSchema.index({
  "offering.name": "text",
  "offering.category": "text",
  "offering.area.size": 1,
  "offering.type": "text",
  status: "text",
});

// Product Schema Middleware
ProductSchema.pre("findOneAndDelete", async function (next) {
  const session = await mongoose.startSession();

  try {
    const product = (await this.model
      .findOne(this.getFilter())
      .session(session)) as IProduct;

    if (!product) next();

    await session.withTransaction(async () => {
      // Unlink listing reference to product
      await mongoose
        .model("Listing", ListingSchema)
        .updateOne(
          { id: product.listing },
          { $pull: { products: product._id } },
          { session: session }
        );
    });

    next();
  } catch (err: any) {
    next(err);
  } finally {
    await session.endSession();
  }
});

export default ProductSchema;
