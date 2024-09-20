import mongoose, { Schema } from "mongoose";
import IPromotion from "../interface/IPromotion";

const baseStoragePath = `https://s3.amazonaws.com/ahia/listing/promotions`;

const PromotionSchema: Schema<IPromotion> = new Schema(
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
    listings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: false,
      },
    ],
    offerings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Offering",
        required: false,
      },
    ],
  },
  { timestamps: true }
);

// Promotion Schema Search Query Index
PromotionSchema.index({ title: "text", rate: 1, startDate: 1, endDate: 1 });

// Promotion Schema Middleware
PromotionSchema.pre("findOneAndDelete", async function (next) {
  try {
    const promotion = (await this.model.findOne(
      this.getFilter()
    )) as IPromotion;

    if (!promotion) next();

    const session = await mongoose.startSession();

    session.withTransaction(async () => {
      // Unlink all offerings referenced to promotion
      const offeringUpdates = promotion.offerings.map((offeringId) => ({
        updateOne: {
          filter: { _id: offeringId, promotion: promotion._id },
          update: { $unset: { promotion: "" } },
        },
      }));

      // Unlink all listings referenced to promotion
      const listingUpdates = promotion.listings.map((listingId) => ({
        updateOne: {
          filter: { _id: listingId, promotion: promotion._id },
          update: { $unset: { promotion: "" } },
        },
      }));

      // Update offerings collection
      await mongoose.model("Offering").bulkWrite(offeringUpdates, { session });

      // Update listings collection
      await mongoose.model("Listing").bulkWrite(listingUpdates, { session });
    });

    next();
  } catch (err: any) {
    next(err);
  }
});

export default PromotionSchema;
