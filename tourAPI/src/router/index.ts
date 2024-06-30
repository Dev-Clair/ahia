import { Request, Response, Router, NextFunction } from "express";
import TourRouterV1 from "./v1/tourRouter";
import TourRouterV2 from "./v2/tourRouter";
import HttpStatusCode from "../enum/httpStatusCode";
import APIError from "../error/apiError";
import NotFoundError from "../error/notfoundError";
import BadRequestError from "../error/badrequestError";
import UnprocessableEntityError from "../error/unprocessableentityError";
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
    if (GlobalErrorHandler.isSyntaxError(err)) {
      next(
        new BadRequestError(HttpStatusCode.BAD_REQUEST, "Bad or Malformed JSON")
      );
    } else {
      next(err);
    }
  }
);

TourRouter.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (GlobalErrorHandler.isSafeError(err)) {
      next(
        new UnprocessableEntityError(
          HttpStatusCode.UNPROCESSABLE_ENTITY,
          err.message
        )
      );
    } else {
      next(
        new APIError(
          "MONGOOSE_ERROR",
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          false,
          err.message
        )
      );
    }
  }
);

TourRouter.use(
  (err: APIError, req: Request, res: Response, next: NextFunction) => {
    if (GlobalErrorHandler.isTrustedError(err)) {
      return res
        .status(err.httpStatusCode)
        .json({ error: err.name, message: err.message });
    } else {
      next(err);
    }
  }
);

TourRouter.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    GlobalErrorHandler.handleError(err);

    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: "INTERNAL_SERVER_ERROR",
      message:
        "Oops! Sorry an error occured on our end, we cannot process your request at this time. Please try again shortly.",
    });
  }
);

export default TourRouter;
