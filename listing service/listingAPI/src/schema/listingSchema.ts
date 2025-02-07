import mongoose, { Schema } from "mongoose";
import IListing from "../interface/IListing";

const baseStoragePath = `https://s3.amazonaws.com/ahia/listing`;

const ListingSchema: Schema<IListing> = new Schema(
  {
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
        validate: {
          validator: mongoose.isValidObjectId,
          message: "Invalid ObjectId",
        },
      },
    ],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: function (this: IListing) {
          if (this.type === "land" || this.type === "property") return "Point";
        },
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function (this: IListing) {
            return this.type === "land" || this.type === "property";
          },
          message: "coordinates is only required for land or property listings",
        },
        required: false,
      },
      address: {
        street: {
          type: String,
          maxlength: 125,
          required: true,
        },
        city: {
          type: String,
          maxlength: 50,
          required: true,
        },
        state: {
          type: String,
          maxlength: 50,
          required: true,
        },
        zip: {
          type: String,
          maxlength: 20,
          required: false,
        },
      },
    },
    provider: {
      type: String,
      validate: {
        validator: (value: string) =>
          /^[0-9a-fA-F]{24}$|^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
            value
          ),
        message: "Invalid ID (must be either an ObjectId or a UUID)",
      },
      required: true,
    },
    media: {
      images: {
        type: [String],
        get: (values: string[] = []) =>
          values.map((value) =>
            value.startsWith("http") ? value : `${baseStoragePath}${value}`
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
            value.startsWith("http") ? value : `${baseStoragePath}${value}`
          ),
        validate: {
          validator: (values: string[]) => values.length <= 3,
          message: "You can only upload up to 3 videos per request.",
        },
        required: false,
      },
    },
    verification: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
        required: false,
      },
      document: {
        id: {
          type: String,
          maxlength: 100,
          required: true,
        },
        type: {
          type: String,
          maxlength: 100,
          required: false,
        },
      },
      issuedBy: {
        type: String,
        maxlength: 255,
        required: false,
      },
    },
  },
  { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } }
);

// Listing Schema Location Index
ListingSchema.index({ "location.coordinates": "2dsphere" }, { sparse: true });

// Listing Schema Text Search Index
ListingSchema.index({
  "location.address.city": "text",
  "location.address.state": "text",
});

export default ListingSchema;
