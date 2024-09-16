import { Schema } from "mongoose";
import ReservationInterface from "../interface/IReservation";

const ReservationSchema: Schema<ReservationInterface> = new Schema({
  booking: {
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
});

export default ReservationSchema;
