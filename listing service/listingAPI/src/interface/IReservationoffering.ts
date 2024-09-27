import IBooking from "./IBooking";
import IOffering from "./IOffering";

export default interface IReservationOffering extends IOffering {
  reservation: [IBooking];
}
