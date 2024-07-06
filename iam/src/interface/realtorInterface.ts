import IAMInterface from "./iamInterface";

export default interface RealtorInterface extends IAMInterface {
  realtorType: "individual" | "corporate";
  companyInformation: {
    name: string;
    email: string;
    phone: string[];
    address: string;
    regNo: string;
    regCert: string;
  };
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
