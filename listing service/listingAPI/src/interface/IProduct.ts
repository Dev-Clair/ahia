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
  verification: {
    status: boolean;
    expiry: Date;
  };
  status?:
    | "now-letting"
    | "closed"
    | "now-booking"
    | "booked"
    | "now-selling"
    | "sold";
}
