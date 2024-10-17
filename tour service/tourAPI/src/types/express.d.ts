import { Request } from "express";
import ITour from "../interface/ITour";

declare global {
  namespace Express {
    export interface Request {
      idempotent?: Record<string, any>;
      tour?: ITour;
    }
  }
}
