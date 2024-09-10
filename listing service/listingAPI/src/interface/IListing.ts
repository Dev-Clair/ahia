import { Schema } from "mongoose";

export default interface IListing {
  name: string;
  description: string;
  slug: string;
  purpose: "lease" | "sell" | "reservation";
  type: "economy" | "premium" | "luxury";
  category: "residential" | "commercial" | "mixed";
  offerings: Schema.Types.ObjectId[];
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
