import IAMInterface from "./iamInterface";

export default interface RealtorInterface extends IAMInterface {
  status: "in_waiting" | "available";
  assignedTours: {
    tourId: string;
  }[];
  security: {
    identityType?: "driver-license" | "passport" | "other";
    identityNo?: string;
    identityDoc?: string;
  }[];
}
