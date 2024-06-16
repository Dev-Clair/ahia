import { Document } from "mongoose";

export default interface RealtorInterface extends Document {
  status: "in_waiting" | "available" | "booked";
  assignedTours: {
    tourId: string;
  }[];
  security: {
    identityType?: "driver-license" | "passport" | "other";
    identityNo?: string;
    identityDoc?: string;
  }[];
}
