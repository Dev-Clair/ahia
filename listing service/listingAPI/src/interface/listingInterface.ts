import { Document, Schema } from "mongoose";
import OfferingInterface from "./offeringInterface";

export default interface ListingInterface extends Document {
  name: string;
  description: string;
  slug: string;
  purpose: "lease" | "sell" | "reservation";
  type: "economy" | "premium" | "luxury";
  category: "residential" | "commercial" | "mixed";
  offering: [OfferingInterface];
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
