import Product from "./productModel";
import IReservationProduct from "../interface/IReservationproduct";
import ReservationProductSchema from "../schema/reservationproductSchema";

const Reservation = Product.discriminator<IReservationProduct>(
  "Reservation",
  ReservationProductSchema
);

export default Reservation;
