// import { NextFunction, Request, Response } from "express";

// /**
//  * Handles synchronous and asynchronous errors
//  * @param Operation
//  * @param Retry
//  * @param RetryOptions
//  * @returns Promise<Response|void>
//  */
// const AsyncCatch = (
//   Operation: (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ) => Promise<Response | void>,
//   Retry?: Function,
//   RetryOptions?: {}
// ) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const executeOperation = () => Operation(req, res, next);

//     if (Retry) {
//       Retry(executeOperation, RetryOptions).catch(next);
//     } else {
//       executeOperation().catch(next);
//     }
//   };
// };

// export default AsyncCatch;

import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

/**
 * Handles synchronous and asynchronous errors and manages transactions if needed.
 * @param Operation
 * @param Retry
 * @param RetryOptions
 * @param UseTransaction
 * @returns Promise<Response|void>
 */
const AsyncCatch = (
  Operation: (
    req: Request,
    res: Response,
    next: NextFunction,
    session?: mongoose.ClientSession
  ) => Promise<Response | void>,
  Retry?: Function,
  RetryOptions?: object,
  UseTransaction: boolean = false
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let session: mongoose.ClientSession | undefined;

    if (UseTransaction) {
      session = await mongoose.startSession();

      session.startTransaction();
    }

    try {
      const executeOperation = () => Operation(req, res, next, session);

      if (Retry) {
        await Retry(executeOperation, RetryOptions);
      } else {
        await executeOperation();
      }

      if (UseTransaction) {
        await session?.commitTransaction();
      }
    } catch (err: any) {
      if (UseTransaction) {
        await session?.abortTransaction();
      }

      next(err);
    } finally {
      if (UseTransaction) {
        session?.endSession();
      }
    }
  };
};

export default AsyncCatch;
