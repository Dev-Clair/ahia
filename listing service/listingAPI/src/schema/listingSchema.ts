import mongoose, { ObjectId, Schema } from "mongoose";
import slugify from "slugify";
import IListing from "../interface/IListing";
import ListingInterfaceType from "../type/listinginterfaceType";
import ListingInterface from "../interface/listingInterface";
import Offering from "../model/offeringModel";

const baseStoragePath = `https://s3.amazonaws.com/ahia/listing`;

const ListingSchema: Schema<IListing, ListingInterfaceType, ListingInterface> =
  new Schema(
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
        unique: true,
        required: false,
      },
      listingType: {
        type: String,
        enum: ["lease", "sell", "reservation"],
        required: true,
      },
      propertyType: {
        type: String,
        enum: ["economy", "premium", "luxury"],
        set: (value: string) => value.toLowerCase(),
        required: true,
      },
      propertyCategory: {
        type: String,
        enum: ["residential", "commercial", "mixed"],
        set: (value: string) => value.toLowerCase(),
        required: true,
      },
      offerings: [
        {
          type: Schema.Types.ObjectId,
          ref: "Offering",
          default: undefined,
        },
      ],
      address: {
        type: String,
        required: true,
      },
      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
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
            return new Date(
              Date.now() + 3 * 24 * 60 * 60 * 1000
            ).toDateString();
          },
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
    const listing = (await this.model.findOne(
      this.getFilter()
    )) as ListingInterface;

    if (!listing) next();

    const session = await mongoose.startSession();

    session.withTransaction(
      async () =>
        await Offering.deleteMany({ listing: listing._id }).session(session)
    );
  } catch (err: any) {
    next(err);
  }

  next();
});

// Listing Schema Instance Methods
ListingSchema.method("retrieveOfferings", async function (): Promise<any> {
  await this.populate("offerings");

  return this.offerings;
});

ListingSchema.method(
  "addOffering",
  async function (offeringId: ObjectId): Promise<void> {
    if (!this.offerings.includes(offeringId)) {
      this.offerings.push(offeringId);

      await this.save();
    }
  }
);

ListingSchema.method(
  "removeOffering",
  async function (offeringId: ObjectId): Promise<void> {
    const offeringIndex = this.offerings.indexOf(offeringId);

    if (offeringIndex > -1) {
      this.offerings.splice(offeringIndex, 1);

      await this.save();
    }
  }
);

export default ListingSchema;
