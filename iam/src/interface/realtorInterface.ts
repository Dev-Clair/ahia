import IAMInterface from "./iamInterface";

export default interface RealtorInterface extends IAMInterface {
  type: "individual" | "corporate";
  company: {
    name: string;
    email: string;
    phone: string[];
    address: string;
    regNo: string;
    regCert: string;
  };
  security: {
    identity: {
      type: "driver-license" | "passport" | "other";
      refNo: string;
      document: string;
    }[];
  };
  tours: string[];
  availability: {
    status: "in_waiting" | "available" | "booked";
    location: {
      type: string;
      coordinates: number[];
    };
  };
}
