import { Request, Response, Router, NextFunction } from "express";
import routerV1 from "./v1/tourRouter";
import routerV2 from "./v2/tourRouter";
import HttpStatusCode from "../enum/httpStatusCode";
import APIError from "../error/apiError";
import NotFoundError from "../error/notfoundError";
import BadRequestError from "../error/badrequestError";
import GlobalErrorHandler from "../middleware/globalErrorHandlingMiddleware.ts";

const router = Router();

router.use("/v1/tours", routerV1);

router.use("/v2/tours", routerV2);

router.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(
    new NotFoundError(
      HttpStatusCode.NOT_FOUND,
      `No resource or route defined for ${req.originalUrl}`
    )
  );
});

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError) {
    next(new BadRequestError(HttpStatusCode.BAD_REQUEST, "Bad JSON"));
  }

  next(err);
});

router.use((err: APIError, req: Request, res: Response, next: NextFunction) => {
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
});

export default router;
