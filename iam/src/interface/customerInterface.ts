import { Document } from "mongoose";

export default interface CustomerInterface extends Document {
  bookedTours: {
    tourId: string;
  }[];
  paymentRecords: {
    paymentId: string;
  }[];
}
