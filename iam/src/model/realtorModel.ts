import mongoose from "mongoose";
import IAM from "./iamModel";

const Schema = mongoose.Schema;

const RealtorSchema = new Schema({
  status: {
    type: String,
    enum: ["in_waiting", "available", "booked"],
    default: "in_waiting",
  },
  location: {
    type: String,
    required: true,
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
        enum: ["scheduled", "completed"],
        default: "scheduled",
      },
    },
  ],
});

const Realtor = IAM.discriminator("Realtor", RealtorSchema);

export default Realtor;
