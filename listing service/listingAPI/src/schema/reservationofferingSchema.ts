import { Schema } from "mongoose";
import IReservationOffering from "../interface/IReservationoffering";

const ReservationOfferingSchema: Schema<IReservationOffering> = new Schema({
  reservation: {
    plan: {
      type: String,
      enum: ["daily", "extended", "mixed"],
      required: true,
    },
    termsAndConditions: {
      type: [String],
      required: false,
    },
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
});

export default ReservationOfferingSchema;
