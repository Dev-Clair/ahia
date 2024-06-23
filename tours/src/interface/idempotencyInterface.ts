import { Document } from "mongoose";

export default interface IdempotencyInterface extends Document {
  key: string;
  response: any;
  createdAt: Date;
}
