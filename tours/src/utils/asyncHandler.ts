import { NextFunction, Request, Response } from "express";

const asyncHandler =
  (operation: Function) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(operation(req, res, next)).catch(next);
  };

export default asyncHandler;
