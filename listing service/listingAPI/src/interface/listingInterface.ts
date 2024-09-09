import { Document } from "mongoose";
import OfferingInterface from "./offeringInterface";

export default interface ListingInterface extends Document {
  name: string;
  description: string;
  slug: string;
  purpose: "lease" | "sell" | "reservation";
  type: "economy" | "premium" | "luxury";
  category: "residential" | "commercial" | "mixed";
  offerings: [OfferingInterface];
  address: string;
  location: {
    type?: string;
    coordinates: number[];
  };
  provider: {
    id?: string;
    email?: string;
  };
  media: {
    picture: string;
    video: string;
  };
  verify: {
    status?: boolean;
    expiry?: Date;
  };
}
