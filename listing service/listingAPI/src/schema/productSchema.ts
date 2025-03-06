import mongoose, { Schema } from "mongoose";
import Config from "../../config";
import IProduct from "../interface/IProduct";
import OfferingSchema from "./offeringSchema";

const baseStoragePath = `https://s3.amazonaws.com/${Config.AWS.S3_BUCKET}/af-south-1/listing-service/products`;

const ProductSchema: Schema<IProduct> = new Schema(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      validate: {
        validator: mongoose.isValidObjectId,
        message: "Invalid ObjectId",
      },
    },
    name: {
      type: String,
      maxlength: 100,
      required: true,
    },
    description: {
      type: String,
      maxlength: 255,
      required: true,
    },
    offering: {
      type: OfferingSchema,
      required: true,
    },
    type: {
      type: String,
      enum: ["Lease", "Reservation", "Sell"],
      required: true,
    },
    media: {
      images: {
        type: [String],
        get: (values: string[] = []) =>
          values.map((value) =>
            value.startsWith("http") ? value : `${baseStoragePath}/products/images/${value}`
          ),
        validate: {
          validator: (values: string[]) => values.length <= 5,
          message: "You can only upload up to 5 images per request.",
        },
        required: false,
      },
      videos: {
        type: [String],
        get: (values: string[] = []) =>
          values.map((value) =>
            value.startsWith("http") ? value : `${baseStoragePath}/products/videos/${value}`
          ),
        validate: {
          validator: (values: string[]) => values.length <= 3,
          message: "You can only upload up to 3 videos per request.",
        },
        required: false,
      },
    },
    status: {
      type: String,
      enum: [
        "now-letting",
        "closed",
        "now-booking",
        "booked",
        "now-selling",
        "sold",
      ],
      default: function (this: IProduct) {
        switch (this.type) {
          case "Lease":
            return "now-letting";
          case "Reservation":
            return "now-booking";
          case "Sell":
            return "now-selling";
          default:
            throw new Error("Invalid product type option");
        }
      },
      required: true,
    },
    verification: {
      status: {
        type: Boolean,
        enum: [true, false],
        default: false,
      },
      expiry: {
        type: Date,
        validate: {
          validator: function (this: IProduct) {
            return this.type !== "Reservation";
          },
          message: "expiry is only required for non-reservation products",
        },
        default: function (this: IProduct) {
          return this.type !== "Reservation"
            ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString()
            : undefined;
        },
        required: false,
      },
    },
  },
  {
    discriminatorKey: "type",
    timestamps: true,
    toJSON: { getters: true, setters: true },
    toObject: { getters: true, setters: true },
  }
);

// Product Schema Text Search Index
ProductSchema.index({
  "offering.name": "text",
  "offering.type": "text",
});

export default ProductSchema;
