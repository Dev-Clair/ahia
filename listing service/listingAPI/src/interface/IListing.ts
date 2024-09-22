import { Document, Schema } from "mongoose";
import ISpace from "./ISpace";

export default interface IListing extends Document {
  name: string;
  description: string;
  slug?: string;
  spaces?: [ISpace];
  category: "residential" | "commercial" | "mixed";
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
  promotion?: Schema.Types.ObjectId;
}
