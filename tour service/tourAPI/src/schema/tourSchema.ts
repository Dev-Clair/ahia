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
    },
    realtor: {
      type: String,
      required: false,
    },
    offerings: [
      {
        type: [String],
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

TourSchema.index({ name: "text", status: "text" });

TourSchema.pre("save", function (next) {
  if (!this.isModified("name")) {
    this.name = `Tour_${this.customer}`;
  }

  next();
});

export default TourSchema;
