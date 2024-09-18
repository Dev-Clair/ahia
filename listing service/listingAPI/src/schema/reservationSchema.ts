import { Schema } from "mongoose";
import IReservation from "../interface/IReservation";

const ReservationSchema: Schema<IReservation> = new Schema({
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
