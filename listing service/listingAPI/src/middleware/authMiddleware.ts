import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import Config from "../../config";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";
import IUser from "../interface/IUser";

/**
 * Ensures role-based access to a resource using JWT
 * @param roles List of allowed roles
 */
const isGranted =
  (roles: string[]) =>
    (req: Request, res: Response, next: NextFunction): Response | void => {
      const authHeader = req.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.sendResponse(HttpCode.UNAUTHORIZED, {
          error: {
            name: HttpStatus.UNAUTHORIZED,
            message: "Unauthorized! No token provided.",
          },
        });
      }

      const token = authHeader.split(" ")[1];

      try {
        const decoded: JwtPayload = jwt.verify(token, Config.JWT_SECRET) as { user: IUser };

        if (!roles.some(role => decoded.user.roles.includes(role))) {
          return res.sendResponse(HttpCode.FORBIDDEN, {
            error: {
              name: HttpStatus.FORBIDDEN,
              message: "Forbidden! You do not have the required permissions.",
            },
          });
        }

        req.user = decoded.user; // Attach user info to request object

        next();
      } catch (error: any) {
        return res.sendResponse(HttpCode.UNAUTHORIZED, {
          error: {
            name: HttpStatus.UNAUTHORIZED,
            message: "Invalid or expired token.",
          },
        });
      }
    };

/**
 * Checks if an authenticated user has the required permissions.
 * @param permissions List of required permissions.
 */
export const isPermitted =
  (permissions: string[]) =>
    (req: Request, res: Response, next: NextFunction) => {
      // Retrieve user info from request object
      const user = req.user as IUser;

      // Check if user is authenticated
      if (!user)
        return res.sendResponse(HttpCode.UNAUTHORIZED, {
          error: {
            name: HttpStatus.UNAUTHORIZED,
            message: "Unauthorized! User not authenticated.",
          },
        });


      // Verify user permissions
      const hasPermissions = permissions.every(permission =>
        user.permissions.includes(permission)
      );

      if (!hasPermissions) {
        return res.sendResponse(HttpCode.FORBIDDEN, {
          error: {
            name: HttpStatus.FORBIDDEN,
            message: "Forbidden! You lack the required permissions.",
          },
        });
      }

      next();
    };

export default { isGranted, isPermitted };
