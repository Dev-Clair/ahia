import { Document, Schema } from "mongoose";

export default interface ISchedule extends Document {
  tour: Schema.Types.ObjectId;
  schedule: {
    date: Date;
    time: string;
  };
}
