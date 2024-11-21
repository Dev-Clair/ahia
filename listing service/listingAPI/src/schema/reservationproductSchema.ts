import { Schema } from "mongoose";
import ReservationSchema from "./reservationSchema";
import IReservationProduct from "../interface/IReservationproduct";

const ReservationProductSchema: Schema<IReservationProduct> = new Schema({
  reservation: {
    type: [ReservationSchema],
    required: true,
  },
});

export default ReservationProductSchema;
