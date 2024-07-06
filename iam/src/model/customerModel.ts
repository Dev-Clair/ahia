import IAM from "./iamModel";
import CustomerSchema from "../schema/customerSchema";
import CustomerInterface from "../interface/customerInterface";

const Customer = IAM.discriminator<CustomerInterface>(
  "Customer",
  CustomerSchema
);

export default Customer;
