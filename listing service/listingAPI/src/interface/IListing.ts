import { Document, Schema } from "mongoose";

export default interface IListing extends Document {
  name: string;
  description: string;
  slug?: string;
  listingType: "lease" | "sell" | "reservation";
  propertyCategory: "residential" | "commercial" | "mixed";
  propertyType: "economy" | "premium" | "luxury";
  offerings: Schema.Types.ObjectId[];
  address: {
    street: string;
    countyLGA: string;
    city: string;
    state: string;
  };
  location: {
    type?: string;
    geoCoordinates?: number[];
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
