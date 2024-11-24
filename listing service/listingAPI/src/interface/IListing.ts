import IDocument from "./IDocument";
import { Schema } from "mongoose";

export default interface IListing extends IDocument {
  name: string;
  description: string;
  type: "land" | "mobile" | "property";
  products?: Schema.Types.ObjectId[];
  location: {
    type: string;
    coordinates: [number, number];
    address: {
      street: string;
      city: string;
      state: string;
      zip?: string;
    };
  };
  provider: string;
  media: {
    image: string[];
    video?: string[];
  };
}
