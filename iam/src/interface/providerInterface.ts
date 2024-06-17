import IAMInterface from "./iamInterface";

export default interface ProviderInterface extends IAMInterface {
  providerType: "individual" | "corporate";
  companyInformation: {
    name?: string;
    email?: string;
    phone?: string[];
    address?: string;
    regNo?: string;
    regCert?: string;
  };
  listingsId: string[];
  security: {
    identityType?: "driver-license" | "passport" | "other";
    identityNo?: string;
    identityDoc?: string;
  }[];
}
