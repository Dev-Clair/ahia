import mongoose, { Schema } from "mongoose";
import slugify from "slugify";
import IOffering from "../interface/IOffering";
import ProductSchema from "./productSchema";

const baseStoragePath = `https://s3.amazonaws.com/ahia/listing/offerings`;

const OfferingSchema: Schema<IOffering> = new Schema(
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
    slug: {
      type: String,
      unique: true,
      required: false,
    },
    description: {
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
    features: {
      type: [String],
      required: true,
    },
    product: {
      type: ProductSchema,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
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
        default: undefined,
      },
      videos: {
        type: [String],
        get: (values: string[]) =>
          values.map((value) => `${baseStoragePath}${value}`),
        default: undefined,
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
  { discriminatorKey: "type" }
);

// Offering Schema Search Query Index
OfferingSchema.index({
  name: "text",
  "area.size": 1,
  "product.name": "text",
  "product.category": "text",
  "product.type": "text",
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
    const offering = (await this.model.findOne(this.getFilter())) as IOffering;

    if (!offering) next();

    const session = await mongoose.startSession();

    session.withTransaction(async () => {
      // Unlink listing reference to offering
      await mongoose
        .model("Listing")
        .updateOne(
          { id: offering.listing },
          { $pull: { offerings: offering._id } },
          { session: session }
        );

      // Unlink promotion reference to offering
      await mongoose
        .model("Promotion")
        .updateOne(
          { id: offering.promotion },
          { $pull: { offerings: offering._id } },
          { session: session }
        );
    });

    next();
  } catch (err: any) {
    next(err);
  }
});

export default OfferingSchema;
