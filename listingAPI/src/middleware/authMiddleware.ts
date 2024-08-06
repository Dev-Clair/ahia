import { NextFunction, Request, Response } from "express";
import HttpStatusCode from "../enum/httpStatusCode";
import VerifyRole from "../controller/authController";

/**
 * Ensures role based access to resource
 * @param role
 * @returns Promise<Response|void>
 */
const IsGranted =
  (role: string) =>
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const userRole = req.headers["role"] as string;

    const status = await VerifyRole(userRole, role);

    if (!status) {
      return res.status(HttpStatusCode.UNAUTHORISED).json({
        data: {
          message: "Unauthorized!\nPermission Denied",
          redirect: "home",
        },
      });
    }

    next();
  };

export default { IsGranted };
