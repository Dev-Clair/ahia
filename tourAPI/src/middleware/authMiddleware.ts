import { NextFunction, Request, Response } from "express";
import HttpStatusCode from "../enum/httpStatusCode";
import VerifyRole from "../controller/authController";

/**
 * Ensures role based access to resource
 * @param role
 * @returns Promise<Response|void>
 */
const IsGranted =
  (roles: string[]) =>
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const userRole = req.headers["role"] as string;

    for (let role of roles) {
      const status = await VerifyRole(userRole, role);

      if (status) {
        return next();
      }
    }

    return res.status(HttpStatusCode.FORBIDDEN).json({
      data: {
        message:
          "Forbidden! You do not have the permission to access this resource",
      },
    });
  };

export default { IsGranted };
