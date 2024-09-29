import { Schema } from "mongoose";
import ReservationSchema from "./reservationSchema";
import IReservationOffering from "../interface/IReservationoffering";

const ReservationOfferingSchema: Schema<IReservationOffering> = new Schema({
  reservation: {
    type: [ReservationSchema],
    required: true,
  },
});

export default ReservationOfferingSchema;
