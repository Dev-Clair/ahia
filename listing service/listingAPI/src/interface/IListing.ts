import IDocument from "./IDocument";
import { Schema } from "mongoose";

export default interface IListing extends IDocument {
  name: string;
  description: string;
  type: "land" | "mobile" | "property";
  products?: Schema.Types.ObjectId[];
  address: {
    street: string;
    city: string;
    state: string;
    zip?: string;
  };
  location: {
    type: string;
    coordinates: [number, number];
  };
  provider: {
    id: string;
    slug: string;
  };
  media: {
    image: string[];
    video?: string[];
  };
}
