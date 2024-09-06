import { Document } from "mongoose";

export default interface OfferingInterface extends Document {
  name?: string;
  type: string;
  price: number;
  features: string[];
  status: "open" | "closed";
  media: {
    image: string;
    video: string;
  };
}
