import { Schema } from "mongoose";
import IAM from "./iamModel";
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

const Customer = IAM.discriminator("Customer", CustomerSchema);

export default Customer;
