import mongoose, { Schema } from "mongoose";
import IPromotion from "../interface/IPromotion";

const baseStoragePath = `https://s3.amazonaws.com/ahia/listing/promotions`;

const PromotionSchema: Schema<IPromotion> = new Schema(
  {
    offerings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Offering",
        required: false,
      },
    ],
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
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
        required: false,
      },
      videos: {
        type: [String],
        get: (values: string[]) =>
          values.map((value) => `${baseStoragePath}${value}`),
        required: false,
      },
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
      const offeringUpdates = promotion.offerings.map((offeringId) => ({
        updateOne: {
          filter: { _id: offeringId, promotion: promotion._id },
          update: { $unset: { promotion: "" } },
        },
      }));

      // Update listings collection
      await mongoose.model("Offering").bulkWrite(offeringUpdates, { session });
    });

    next();
  } catch (err: any) {
    next(err);
  }
});

export default PromotionSchema;
