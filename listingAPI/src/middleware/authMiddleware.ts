import { NextFunction, Request, Response } from "express";
import ForbiddenError from "../error/forbiddenError";
import HttpStatusCode from "../enum/httpStatusCode";
import VerifyRole from "../controller/authController";

const IsGranted =
  (role: string) => (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.headers["role"] as string;

    if (!VerifyRole(userRole, role)) {
      throw new ForbiddenError(HttpStatusCode.FORBIDDEN, "");
    }

    next();
  };

export default IsGranted;
