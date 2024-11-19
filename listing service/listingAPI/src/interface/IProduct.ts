import IDocument from "./IDocument";
import { Schema } from "mongoose";
import IOffering from "./IOffering";

export default interface IProduct extends IDocument {
  listing: Schema.Types.ObjectId;
  name: string;
  description: string;
  offering: IOffering;
  type: "Lease" | "Reservation" | "Sell";
  media: {
    images: string[];
    videos?: string[];
  };
  promotion: "Platinum" | "Gold" | "Ruby" | "Silver";
  verification: {
    status: boolean;
    expiry: Date;
  };
}
