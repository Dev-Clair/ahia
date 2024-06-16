import { Schema } from "mongoose";
import IAM from "./iamModel";
import CustomerInterface from "../interface/customerInterface";

const CustomerSchema: Schema<CustomerInterface> = new Schema({
  bookedTours: [
    {
      tourId: {
        type: String,
        trim: true,
        required: true,
      },
    },
  ],
  paymentRecords: [
    {
      paymentId: {
        type: String,
        trim: true,
        required: true,
      },
    },
  ],
});

const Customer = IAM.discriminator("Customer", CustomerSchema);

export default Customer;
