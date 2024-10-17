import { Document, Schema } from "mongoose";

export default interface ISchedule extends Document {
  _id: Schema.Types.ObjectId;
  id: () => string;
  tour: Schema.Types.ObjectId;
  schedule: {
    date: string;
    time: string;
  };
}
