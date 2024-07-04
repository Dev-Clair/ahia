import IAMInterface from "./iamInterface";

export default interface CustomerInterface extends IAMInterface {
  bookedTours: {
    tourId: string;
  }[];
  paymentRecords: {
    paymentId: string;
  }[];
}
