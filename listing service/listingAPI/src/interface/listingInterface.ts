import { Document } from "mongoose";
import OfferingInterface from "./offeringInterface";

export default interface ListingInterface extends Document {
  name: string;
  description: string;
  slug: string;
  purpose: "lease" | "sell" | "reservation" | "mixed";
  type: "economy" | "premium" | "luxury" | "mixed";
  category: "residential" | "commercial" | "mixed";
  offerings: [OfferingInterface];
  address: {
    street: string;
    zone: string;
    countyLGA: string;
    state: string;
  };
  location: {
    type: string;
    coordinates: number[];
  };
  provider: {
    id: string;
    email: string;
  };
  verify: {
    status: boolean;
    expiry: Date;
  };
}
