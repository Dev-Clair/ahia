import { NextFunction, Request, Response } from "express";

const AsyncErrorWrapper =
  (operation: Function | any) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(operation(req, res, next)).catch(next);
  };

export default AsyncErrorWrapper;
