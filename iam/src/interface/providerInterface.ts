import IAMInterface from "./iamInterface";

export default interface ProviderInterface extends IAMInterface {
  type: "individual" | "corporate";
  company: {
    name: string;
    email: string;
    phone: string[];
    address: string;
    regNo: string;
    regCert: string;
  };
  listings: string[];
  security: {
    identity: {
      type: "driver-license" | "passport" | "other";
      refNo: string;
      document: string;
    }[];
  };
}
