import { NextFunction, Request, Response } from "express";
import ForbiddenError from "../error/forbiddenError";
import HttpStatusCode from "../enum/httpStatusCode";

const IsGrantedAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.headers["Role"] as string;

  if (userRole !== "Admin") {
    throw new ForbiddenError(HttpStatusCode.FORBIDDEN, "Unauthorized");
  }

  next();
};

const IsGrantedProvider = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.headers["Role"] as string;

  if (userRole !== "Provider") {
    throw new ForbiddenError(HttpStatusCode.FORBIDDEN, "Unauthorized");
  }
};

const IsGrantedRealtor = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.headers["Role"] as string;

  if (userRole !== "Realtor") {
    throw new ForbiddenError(HttpStatusCode.FORBIDDEN, "Unauthorized");
  }
};

const IsGrantedCustomer = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.headers["Role"] as string;

  if (userRole !== "Customer") {
    throw new ForbiddenError(HttpStatusCode.FORBIDDEN, "Unauthorized");
  }
};

export default {
  IsGrantedAdmin,
  IsGrantedProvider,
  IsGrantedRealtor,
  IsGrantedCustomer,
};
