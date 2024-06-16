import { Document } from "mongoose";

export default interface IAMInterface extends Document {
  firstName: string;
  lastName: string;
  userName: string;
  passwordHash: string;
  contactInformation: {
    email: string;
    phone: string;
  };
  verified: boolean;
  role: "Customer" | "Realtor" | "Provider";
  createdAt: Date;
}
