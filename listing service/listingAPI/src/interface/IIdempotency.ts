import { Document } from "mongoose";

export default interface IIdempotency extends Document {
  key: string;
  createdAt: Date;
}
