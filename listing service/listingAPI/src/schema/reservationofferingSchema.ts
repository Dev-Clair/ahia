import { Schema } from "mongoose";
import BookingSchema from "./bookingSchema";
import IReservationOffering from "../interface/IReservationoffering";

const ReservationOfferingSchema: Schema<IReservationOffering> = new Schema({
  reservation: {
    type: [BookingSchema],
    required: true,
  },
});

export default ReservationOfferingSchema;
