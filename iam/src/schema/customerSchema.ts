import { Schema } from "mongoose";
import CustomerInterface from "../interface/customerInterface";

const CustomerSchema: Schema<CustomerInterface> = new Schema({
  bookedTours: [
    {
      tourId: {
        type: String,
        trim: true,
        required: false,
      },
    },
  ],
  paymentRecords: [
    {
      paymentId: {
        type: String,
        trim: true,
        required: false,
      },
    },
  ],
});

export default CustomerSchema;
