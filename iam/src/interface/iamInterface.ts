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
  role: "Customer" | "Realtor" | "Provider";
  verified: boolean;
  accountStatus: "active" | "inactive" | "suspended";
  createdAt: Date;
}
