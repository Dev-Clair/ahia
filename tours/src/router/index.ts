import { Request, Response, Router, NextFunction } from "express";
import routerV1 from "./v1/tourRouter";
import routerV2 from "./v2/tourRouter";
import BaseError from "../error/baseError";
import NotFoundError from "../error/notfoundError";
import BadRequestError from "../error/badrequestError";
import InternalServerError from "../error/internalserverError";
import globalErrorHandler from "../middleware/globalErrorHandlingMiddleware.ts";

const router = Router();

router.use("/v1/tours", routerV1);

router.use("/v2/tours", routerV2);

router.all("*", (req: Request, res: Response, next: NextFunction) => {
  throw new NotFoundError(
    `No resource or route defined for ${req.originalUrl}`
  );
});

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError) {
    throw new BadRequestError("Bad JSON");
  }
});

router.use(
  (err: BaseError, req: Request, res: Response, next: NextFunction) => {
    if (globalErrorHandler.isTrustedError(err)) {
      return res
        .status(err.errorCode)
        .json({ error: err.name, message: err.message });
    }

    globalErrorHandler.handleAPIError(err);
  }
);

export default router;
