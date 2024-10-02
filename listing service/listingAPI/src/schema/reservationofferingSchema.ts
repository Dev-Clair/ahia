import { Schema } from "mongoose";
import ReservationSchema from "./reservationSchema";
import IReservationOffering from "../interface/IReservationoffering";

const ReservationOfferingSchema: Schema<IReservationOffering> = new Schema({
  status: {
    type: String,
    enum: ["now-booking", "booked"],
    default: "now-booking",
  },
  reservation: {
    type: [ReservationSchema],
    required: true,
  },
});

export default ReservationOfferingSchema;
