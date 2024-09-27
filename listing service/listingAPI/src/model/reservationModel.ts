import Offering from "./offeringModel";
import IReservationOffering from "../interface/IReservationoffering";
import ReservationOfferingSchema from "../schema/reservationofferingSchema";

const Reservation = Offering.discriminator<IReservationOffering>(
  "Reservation",
  ReservationOfferingSchema
);

export default Reservation;
