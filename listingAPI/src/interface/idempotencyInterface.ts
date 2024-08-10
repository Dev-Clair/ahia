import { Document } from "mongoose";

export default interface IdempotencyInterface extends Document {
  key: string;
  createdAt: Date;
}
