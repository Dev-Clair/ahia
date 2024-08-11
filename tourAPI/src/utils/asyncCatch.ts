import { NextFunction, Request, Response } from "express";

/**
 * Handles synchronous and asynchronous errors
 * @param Operation
 * @param Retry
 * @param RetryOptions
 * @returns Promise<Response|void>
 */
const AsyncCatch = (
  Operation: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<Response | void>,
  Retry?: Function,
  RetryOptions?: object
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

export default AsyncCatch;
