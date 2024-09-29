import IBooking from "./IReservation";
import IOffering from "./IOffering";

export default interface IReservationOffering extends IOffering {
  reservation: [IBooking];
}
