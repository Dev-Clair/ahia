import { Document } from "mongoose";

export default interface IdempotencyInterface extends Document {
  key: String;
  response: any;
  createdAt: Date;
}
