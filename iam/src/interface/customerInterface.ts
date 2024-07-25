import { Schema } from "mongoose";
import IAMInterface from "./iamInterface";

export default interface CustomerInterface extends IAMInterface {
  tours: string[];
  payments: string[];
  subscription: Schema.Types.ObjectId[];
}
