import mongoose, { ObjectId, Schema } from "mongoose";
import Listing from "../model/listingModel";
import Offering from "../model/offeringModel";
import IPromotion from "../interface/IPromotion";
import PromotionInterfaceType from "../type/promotioninterfaceType";
import PromotionInterface from "../interface/promotionInterface";

const baseStoragePath = `https://s3.amazonaws.com/ahia/listing/promotions`;

const PromotionSchema: Schema<
  IPromotion,
  PromotionInterfaceType,
  PromotionInterface
> = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    promotionType: {
      type: String,
      enum: ["offer", "discount"],
      required: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    media: {
      images: [
        {
          type: String,
          get: (values: string[]) =>
            values.map((value) => `${baseStoragePath}${value}`),
          default: undefined,
        },
      ],
      videos: [
        {
          type: String,
          get: (values: string[]) =>
            values.map((value) => `${baseStoragePath}${value}`),
          default: undefined,
        },
      ],
    },
    listings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        default: undefined,
      },
    ],
    offerings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Offering",
        default: undefined,
      },
    ],
  },
  { timestamps: true }
);

// Promotion Schema Search Query Index
PromotionSchema.index({ startDate: 1, endDate: 1 });

// Promotion Schema Middleware
PromotionSchema.pre("findOneAndDelete", async function (next) {
  try {
    const promotion = (await this.model.findOne(
      this.getFilter()
    )) as PromotionInterface;

    if (!promotion) next();

    const session = await mongoose.startSession();

    session.withTransaction(async () => {
      const offering = await Offering?.findOne({
        promotion: promotion._id,
      }).session(session);

      if (!offering) next();

      const listing = await Listing?.findOne({
        promotion: promotion._id,
      }).session(session);

      if (!listing) next();

      offering?.$set("promotion", undefined);

      listing?.$set("promotion", undefined);

      await offering?.save({ session });

      await listing?.save({ session });
    });
  } catch (err: any) {
    next(err);
  }

  next();
});

// Promotion Schema Instance Methods
PromotionSchema.method("fetchListings", async function (): Promise<any> {
  await this.populate("listings");

  return this.listings;
});

PromotionSchema.method(
  "addListing",
  async function (listingId: ObjectId): Promise<void> {
    if (!this.listings.includes(listingId)) {
      this.offerings.push(listingId);

      await this.save();
    }
  }
);

PromotionSchema.method(
  "removeListing",
  async function (listingId: ObjectId): Promise<void> {
    const listingIndex = this.listings.indexOf(listingId);

    if (listingIndex > -1) {
      this.offerings.splice(listingIndex, 1);

      await this.save();
    }
  }
);

PromotionSchema.method("fetchOfferings", async function (): Promise<any> {
  await this.populate("offerings");

  return this.offerings;
});

PromotionSchema.method(
  "addOffering",
  async function (offeringId: ObjectId): Promise<void> {
    if (!this.offerings.includes(offeringId)) {
      this.offerings.push(offeringId);

      await this.save();
    }
  }
);

PromotionSchema.method(
  "removeOffering",
  async function (offeringId: ObjectId): Promise<void> {
    const offeringIndex = this.offerings.indexOf(offeringId);

    if (offeringIndex > -1) {
      this.offerings.splice(offeringIndex, 1);

      await this.save();
    }
  }
);

PromotionSchema.method(
  "checkPromotionValidity",
  function checkPromotionValidity(date: Date = new Date()): boolean {
    return this.startDate <= date && this.endDate >= date;
  }
);

PromotionSchema.method(
  "reactivatePromotion",
  async function reactivatePromotion(
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    this.startDate = this.startDate <= startDate ? startDate : this.startDate;

    this.endDate = this.endDate <= endDate ? endDate : this.endDate;

    if (this.startDate === startDate && this.endDate === endDate)
      await this.save();

    throw new Error("Invalid Arguments Exception");
  }
);

export default PromotionSchema;
