import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";
import Config from "../../config";
import IUser from "../interface/IUser";

/**
 * Ensures role-based access to a resource using JWT
 * @param roles Allowed roles
 */
const isGranted =
  (roles: string[]) =>
    (req: Request, res: Response, next: NextFunction): Response | void => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(HttpCode.UNAUTHORIZED).json({
          error: {
            name: HttpStatus.UNAUTHORIZED,
            message: "Unauthorized! No token provided.",
          },
        });
      }

      const token = authHeader.split(" ")[1];

      try {
        const decoded = jwt.verify(token, Config.JWT_SECRET) as { user: IUser };

        if (!roles.some(role => decoded.user.roles.includes(role))) {
          return res.status(HttpCode.FORBIDDEN).json({
            error: {
              name: HttpStatus.FORBIDDEN,
              message: "Forbidden! You do not have the required permissions.",
            },
          });
        }

        (req as Request).user = decoded.user as IUser; // Attach user info to request

        next();
      } catch (error) {
        return res.status(HttpCode.UNAUTHORIZED).json({
          error: {
            name: HttpStatus.UNAUTHORIZED,
            message: "Invalid or expired token.",
          },
        });
      }
    };

export default { isGranted };