import IProduct from "./IProduct";
import IReservation from "./IReservation";

export default interface IReservationProduct extends IProduct {
  status: "now-booking" | "booked";
  reservation: [IReservation];
}