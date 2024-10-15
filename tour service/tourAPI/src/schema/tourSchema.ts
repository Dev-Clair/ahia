import { Schema } from "mongoose";
import ITour from "../interface/ITour";

const TourSchema: Schema<ITour> = new Schema(
  {
    name: {
      type: String,
      required: false,
    },
    customer: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => /^[0-9a-fA-F]{24}$/.test(value),
        message: "Invalid ID Format",
      },
    },
    realtor: {
      type: String,
      required: false,
      validate: {
        validator: (value: string) => /^[0-9a-fA-F]{24}$/.test(value),
        message: "Invalid ID Format",
      },
    },
    offerings: [
      {
        type: String,
        required: true,
      },
    ],
    schedule: {
      date: {
        type: Date,
        required: false,
      },
      time: {
        type: String,
        required: false,
      },
    },
    status: {
      type: String,
      enum: ["pending", "ongoing", "completed", "cancelled"],
      default: "pending",
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

TourSchema.pre("save", function (next) {
  if (!this.isModified("name")) {
    this.name = `Tour_${this.customer}`;
  }

  next();
});

export default TourSchema;
