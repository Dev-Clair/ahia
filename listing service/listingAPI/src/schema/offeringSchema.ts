import mongoose, { Schema } from "mongoose";
import slugify from "slugify";
import IOffering from "../interface/IOffering";

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
      required: false,
    },
    slug: {
      type: String,
      // unique: true,
      required: false,
    },
    quantity: {
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
    features: {
      type: [String],
      required: true,
    },
    category: {
      type: String,
      enum: ["economy", "premium", "luxury"],
      set: (value: string) => value.toLowerCase(),
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    type: {
      type: String,
      enum: ["lease", "reservation", "sell"],
      required: true,
    },
    use: {
      type: String,
      enum: [
        "residential",
        "commercial",
        "industrial",
        "institutional",
        "agricultural",
        "special",
        "mixed",
      ],
      set: (value: string) => value.toLowerCase(),
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
  },
  { discriminatorKey: "type" }
);

// Offering Schema Search Query Index
OfferingSchema.index({
  name: "text",
  "area.size": 1,
  "price.amount": 1,
  status: "text",
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
    });

    next();
  } catch (err: any) {
    next(err);
  }
});

export default OfferingSchema;
