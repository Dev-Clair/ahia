import { Schema } from "mongoose";
import ReservationInterface from "../interface/reservationInterface";

const ReservationSchema: Schema<ReservationInterface> = new Schema({
  booking: {
    plan: {
      type: String,
      enum: ["daily", "extended"],
      required: true,
    },
    termsAndConditions: {
      type: [String],
      required: false,
    },
  },
});

export default ReservationSchema;
