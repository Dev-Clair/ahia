import { Request } from "express";
import ITour from "../interface/ITour";

declare global {
  namespace Express {
    export interface Request {
      tour?: ITour;
    }
  }
}
