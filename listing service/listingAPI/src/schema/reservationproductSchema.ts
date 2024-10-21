import { Schema } from "mongoose";
import ReservationSchema from "./reservationSchema";
import IReservationProduct from "../interface/IReservationproduct";

const ReservationProductSchema: Schema<IReservationProduct> = new Schema({
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

export default ReservationProductSchema;
