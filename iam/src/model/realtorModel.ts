import mongoose from "mongoose";
import IAM from "./iamModel";

const Schema = mongoose.Schema;

const RealtorSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["in_waiting", "available", "booked"],
      default: "in_waiting",
    },
    assignedTours: [
      {
        tourId: {
          type: String,
          trim: true,
          required: true,
        },
        customerId: {
          type: String,
          trim: true,
          required: true,
        },
        listingIds: [
          {
            type: String,
            trim: true,
            required: true,
          },
        ],
        scheduledDate: {
          type: Date,
          required: true,
        },
        status: {
          type: String,
          enum: ["scheduled", "completed", "cancelled"],
          default: "scheduled",
        },
      },
    ],
    security: [
      {
        identityType: {
          type: String,
          enum: ["driver-license", "passport", "other"],
          required: false,
        },
        identityNo: {
          type: String,
          required: false,
        },
        identityDoc: {
          type: String,
          required: false,
        },
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

RealtorSchema.virtual("completedTours").get(function () {
  return this.assignedTours.filter(
    (assignedTour) => assignedTour.status === "completed"
  ).length;
});

RealtorSchema.virtual("cancelledTours").get(function () {
  return this.assignedTours.filter(
    (cancelledTour) => cancelledTour.status === "cancelled"
  ).length;
});

const Realtor = IAM.discriminator("Realtor", RealtorSchema);

export default Realtor;
