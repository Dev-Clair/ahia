import { Schema } from "mongoose";
import IReservation from "../interface/IReservation";

const ReservationSchema: Schema<IReservation> = new Schema(
  {
    plan: {
      type: String,
      enum: ["daily", "extended"],
      required: [true, "invalid reservation plan"],
    },
    price: {
      amount: {
        type: Number,
        required: [true, "price is required"],
      },
      currency: {
        type: String,
        required: [true, "currency is required"],
      },
    },
    termsAndConditions: {
      type: [String],
      required: false,
    },
  },
  { _id: false, versionKey: false }
);

export default ReservationSchema;
