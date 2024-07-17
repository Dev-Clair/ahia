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
  securityInformation: {
    identityType?: "driver-license" | "passport" | "other";
    identityNo?: string;
    identityDoc?: string;
  }[];
  assignedTours: {
    tourId: string;
  }[];
  availability: {
    status: "in_waiting" | "available" | "booked";
    location: {
      type: string;
      coordinates: number;
    };
  };
}
