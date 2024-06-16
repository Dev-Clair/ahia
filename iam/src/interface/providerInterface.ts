import { Document } from "mongoose";

export default interface ProviderInterface extends Document {
  providerType: "individual" | "corporate";
  companyInformation: {
    name: string;
    email: string;
    phone: string[];
    address: string;
    regNo: string;
    regCert: string;
  };
  listings: string[];
  security: {
    identityType?: "driver-license" | "passport" | "other";
    identityNo?: string;
    identityDoc?: string;
  }[];
}
