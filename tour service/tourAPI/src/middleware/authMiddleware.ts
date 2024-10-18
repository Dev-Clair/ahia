import { NextFunction, Request, Response } from "express";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";
import VerifyRole from "../controller/authController";

/**
 * Ensures role based access to resource
 * @param role
 */
const IsGranted =
  (roles: string[]) =>
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const userRole = req.headers["role"] as string;

    const status = await Promise.all(
      roles.map((role) => VerifyRole(userRole, role))
    );

    if (status.some((status) => status)) return next();

    return res.status(HttpCode.FORBIDDEN).json({
      error: {
        name: HttpStatus.FORBIDDEN,
        message:
          "Forbidden! You do not have the permissions to access this resource",
      },
    });
  };

export default { IsGranted };
