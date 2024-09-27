import { Schema } from "mongoose";
import IBooking from "../interface/IBooking";

const BookingSchema: Schema<IBooking> = new Schema(
  {
    plan: {
      type: String,
      enum: ["daily", "extended"],
      required: true,
    },
    price: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
      },
    },
    termsAndConditions: {
      type: [String],
      required: false,
    },
  },
  { _id: false, versionKey: false }
);

export default BookingSchema;
