import { Request, Response, Router, NextFunction } from "express";
import TourRouterV1 from "./v1/tourRouter";
import TourRouterV2 from "./v2/tourRouter";
import HttpStatusCode from "../enum/httpStatusCode";
import APIError from "../error/apiError";
import NotFoundError from "../error/notfoundError";
import BadRequestError from "../error/badrequestError";
import GlobalErrorHandler from "../middleware/globalErrorHandlingMiddleware.ts";

const TourRouter = Router();

TourRouter.use("/v1/tours", TourRouterV1);

TourRouter.use("/v2/tours", TourRouterV2);

TourRouter.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(
    new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No resource or route defined for ${req.originalUrl}`
    )
  );
});

TourRouter.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError) {
      next(new BadRequestError(HttpStatusCode.BAD_REQUEST, "Bad JSON"));
    }

    next(err);
  }
);

TourRouter.use(
  (err: APIError, req: Request, res: Response, next: NextFunction) => {
    if (GlobalErrorHandler.isTrustedError(err)) {
      return res
        .status(err.httpStatusCode)
        .json({ error: err.name, message: err.message });
    }

    GlobalErrorHandler.handleAPIError(err);

    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL SERVER ERROR",
      message:
        "Oops! Sorry an error occured on our end, we cannot process your request at this time. Please try again shortly.",
    });
  }
);

export default TourRouter;
