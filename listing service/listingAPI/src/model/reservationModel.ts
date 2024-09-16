import Listing from "./listingModel";
import IReservation from "../interface/IReservation";
import ReservationSchema from "../schema/reservationSchema";

const Reservation = Listing.discriminator<IReservation>(
  "Reservation",
  ReservationSchema
);

export default Reservation;
