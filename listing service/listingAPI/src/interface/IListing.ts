import { Document, Schema } from "mongoose";

export default interface IListing extends Document {
  name: string;
  description: string;
  slug?: string;
  listingType: "lease" | "sell" | "reservation";
  propertyType: "economy" | "premium" | "luxury";
  propertyCategory: "residential" | "commercial" | "mixed";
  offerings: Schema.Types.ObjectId[];
  address: string;
  location: {
    type?: string;
    coordinates?: number[];
  };
  provider: {
    id: string;
    email: string;
  };
  media: {
    image?: string;
    video?: string;
  };
  verification: {
    status?: boolean;
    expiry?: Date;
  };
  featured: {
    status: true | false;
    type: "basic" | "plus" | "prime";
  };
  promotion?: Schema.Types.ObjectId;
}
