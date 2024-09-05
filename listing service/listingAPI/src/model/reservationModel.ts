import Listing from "./listingModel";
import ReservationSchema from "../schema/reservationSchema";
import ReservationInterface from "../interface/reservationInterface";

const Reservation = Listing.discriminator<ReservationInterface>(
  "Reservation",
  ReservationSchema
);

export default Reservation;
