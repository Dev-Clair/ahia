import { Schema } from "mongoose";
import IDocument from "./IDocument";

export default interface ISchedule extends IDocument {
  tour: Schema.Types.ObjectId;
  schedule: {
    date: string;
    time: string;
  };
}
