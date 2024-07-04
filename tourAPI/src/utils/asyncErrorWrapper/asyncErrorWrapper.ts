import { NextFunction, Request, Response } from "express";

const AsyncErrorWrapper = (
  operation: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<Response | void>,
  retryStrategy?: Function,
  retryOptions?: {}
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const executeOperation = () => operation(req, res, next);

    if (retryStrategy) {
      retryStrategy(executeOperation, retryOptions).catch(next);
    } else {
      executeOperation().catch(next);
    }
  };
};

export default AsyncErrorWrapper;
