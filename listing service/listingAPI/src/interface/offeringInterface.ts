import { Document } from "mongoose";

export default interface OfferingInterface extends Document {
  id: string;
  type: string;
  features: string[];
  status: "open" | "closed";
}
