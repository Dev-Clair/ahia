import IOffering from "./IOffering";
import IReservation from "./IReservation";

export default interface IReservationOffering extends IOffering {
  status: "now-booking" | "booked";
  reservation: [IReservation];
}
