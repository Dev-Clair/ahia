import { Document } from "mongoose";

export default interface IAMInterface extends Document {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  verified: boolean;
  role: "Customer" | "Realtor" | "Provider" | "Admin";
  accountStatus: "active" | "inactive" | "suspended";
  createdAt: Date;
}