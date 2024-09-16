import mongoose, { ObjectId, Schema } from "mongoose";
import IPromotion from "../interface/IPromotion";
import Listing from "../model/listingModel";
import Offering from "../model/offeringModel";

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
    listings: {
      type: [Schema.Types.ObjectId],
      ref: "Listing",
      default: undefined,
    },
    offerings: {
      type: [Schema.Types.ObjectId],
      ref: "Offering",
      default: undefined,
    },
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
      const offerings = await Offering.find({
        promotion: promotion._id,
      }).session(session);

      if (offerings.length !== 0) {
        offerings.forEach(async (offering) => {
          if (promotion.offerings.includes(offering._id as ObjectId)) {
            offering.$set("promotion", undefined);

            await offering.save({ session });
          }
        });
      }
      // Unlink all listings referenced to promotion
      const listings = await Listing.find({
        promotion: promotion._id,
      }).session(session);

      if (listings.length !== 0) {
        listings.forEach(async (listing) => {
          if (promotion.listings.includes(listing._id as ObjectId)) {
            listing.$set("promotion", undefined);

            await listing.save({ session });
          }
        });
      }

      next();
    });
  } catch (err: any) {
    next(err);
  }
});

export default PromotionSchema;
