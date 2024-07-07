import { NextFunction, Request, Response } from "express";

const AsyncErrorWrapper = (
  Operation: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<Response | void>,
  Retry?: Function,
  RetryOptions?: {}
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const executeOperation = () => Operation(req, res, next);

    if (Retry) {
      Retry(executeOperation, RetryOptions).catch(next);
    } else {
      executeOperation().catch(next);
    }
  };
};

export default AsyncErrorWrapper;
