import { Request, Response, Router, NextFunction } from "express";
import TourRouterV1 from "./v1/tourRouter";
import TourRouterV2 from "./v2/tourRouter";
import HttpStatusCode from "../enum/httpStatusCode";
import APIError from "../error/apiError";
import GlobalErrorHandler from "../middleware/globalErrorHandlingMiddleware.ts";

const TourRouter = Router();

TourRouter.use("/v1/tours", TourRouterV1);

TourRouter.use("/v2/tours", TourRouterV2);

TourRouter.all("*", (req: Request, res: Response, next: NextFunction) => {
  return res
    .status(HttpStatusCode.NOT_FOUND)
    .json({ message: `No resource or route defined for ${req.originalUrl}` });
});

TourRouter.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      return next(err);
    }

    if (GlobalErrorHandler.isSyntaxError(err)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ error: err.name, message: "Bad or Malformed JSON" });
    }

    if (GlobalErrorHandler.isSafeError(err)) {
      if (err.name === "ValidationError" || err.name === "CastError") {
        return res.status(HttpStatusCode.UNPROCESSABLE_ENTITY).json({
          error: err.name,
          message: JSON.stringify(err.message),
        });
      } else {
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          error: err.name,
          message: err.message,
        });
      }
    }
  }
);

TourRouter.use(
  (err: APIError, req: Request, res: Response, next: NextFunction) => {
    if (GlobalErrorHandler.isTrustedError(err)) {
      return res
        .status(err.httpStatusCode)
        .json({ error: err.name, message: err.message });
    }

    GlobalErrorHandler.handleError(err);

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message:
        "Oops! Sorry an error occured on our end, we cannot process your request at this time. Please try again shortly.",
    });
  }
);

export default TourRouter;
