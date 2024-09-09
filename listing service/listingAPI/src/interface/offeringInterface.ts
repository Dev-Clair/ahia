import { Document } from "mongoose";

export default interface OfferingInterface extends Document {
  name: string;
  slug: string;
  type: string;
  price: number;
  features: string[];
  status: "open" | "closed";
  media: {
    picture: string[];
    video: string[];
  };
}
