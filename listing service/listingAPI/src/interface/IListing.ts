import { Document, Schema } from "mongoose";

export default interface IListing extends Document {
  name: string;
  description: string;
  slug?: string;
  type: "property" | "land";
  offerings?: Schema.Types.ObjectId[];
  address: {
    street: string;
    countyLGA: string;
    city: string;
    state: string;
  };
  location: {
    type: string;
    geoCoordinates: number[];
  };
  provider: {
    id: string;
    email: string;
  };
  media: {
    image: string;
    video: string;
  };
  verification: {
    status: boolean;
    expiry: Date;
  };
  promotion?: Schema.Types.ObjectId;
}
