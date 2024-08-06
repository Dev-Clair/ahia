import { NextFunction, Request, Response } from "express";
import VerifyRole from "../controller/authController";

const IsAuthenticated = (req: Request, res: Response, next: NextFunction) => {};

/**
 * Ensures role based access to resource
 * @param role
 * @returns void
 */
const IsGranted =
  (roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.headers["role"] as string;

    roles.forEach(async (role) => {
      try {
        const status = await VerifyRole(userRole, role);

        if (status) next();
      } catch (err: any) {
        next(err);
      }
    });
  };

export default IsGranted;
