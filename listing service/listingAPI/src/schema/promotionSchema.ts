import mongoose, { Schema } from "mongoose";
import IPromotion from "../interface/IPromotion";

const PromotionSchema: Schema<IPromotion> = new Schema(
  {
    offerings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Offering",
        required: false,
      },
    ],
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
  },
  { timestamps: true }
);

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

      await mongoose.model("Offering").bulkWrite(offeringUpdates, { session });
    });

    next();
  } catch (err: any) {
    next(err);
  }
});

export default PromotionSchema;
