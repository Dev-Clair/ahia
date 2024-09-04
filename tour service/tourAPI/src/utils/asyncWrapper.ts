import { NextFunction, Request, Response } from "express";

/**
 * Propagates operational and non-operational errors to the custom global error handling middleware
 */
class AsyncWrapper {
  /**
   * Catch errors from async route handlers
   * @param Operation
   * @param Retry
   * @param RetryOptions
   * @returns Function
   */
  static Catch(
    Operation: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<Response | void>,
    Retry?: Function,
    RetryOptions?: object
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      const executeOperation = () => Operation(req, res, next);

      if (Retry) {
        Retry(executeOperation, RetryOptions).catch(next);
      } else {
        executeOperation().catch(next);
      }
    };
  }
}

export default AsyncWrapper;
