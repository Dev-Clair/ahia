import mongoose, { Schema } from "mongoose";
import slugify from "slugify";
import IOffering from "../interface/IOffering";

const baseStoragePath = `https://s3.amazonaws.com/ahia/listing/offerings`;

const OfferingSchema: Schema<IOffering> = new Schema({
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  offeringType: {
    type: String,
    required: true,
  },
  offeringCategory: {
    type: String,
    enum: ["economy", "premium", "luxury"],
    set: (value: string) => value.toLowerCase(),
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
      await mongoose
        .model("Listing")
        .findOneAndUpdate(
          { id: offering.listing },
          { $pull: { offerings: offering._id } },
          { new: false, session }
        );
    });

    next();
  } catch (err: any) {
    next(err);
  }
});

export default OfferingSchema;
