import { Schema } from "mongoose";
import slugify from "slugify";
import OfferingInterface from "../interface/offeringInterface";

const baseStoragePath = `https://s3.amazonaws.com/ahia/listing/offering`;

const OfferingSchema: Schema<OfferingInterface> = new Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    required: false,
  },
  type: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
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
    picture: {
      type: [String],
      get: (values: string[]) =>
        values.map((value) => `${baseStoragePath}${value}`),
      required: true,
    },
    video: {
      type: [String],
      get: (values: string[]) =>
        values.map((value) => `${baseStoragePath}${value}`),
      required: true,
    },
  },
});

// Offering Schema Search Query Index
OfferingSchema.index({ name: "text", type: "text" });

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

export default OfferingSchema;
