import { Schema } from "mongoose";
import IDocument from "./IDocument";

export default interface IRealtor extends IDocument {
  tour: Schema.Types.ObjectId;
  realtor: string;
}
