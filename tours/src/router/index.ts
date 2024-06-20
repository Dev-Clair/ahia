import { Request, Response, Router, NextFunction } from "express";
import routerV1 from "./v1/tourRouter";
import routerV2 from "./v2/tourRouter";
import APIError from "../error/apiError";
import NotFoundError from "../error/notfoundError";
import BadRequestError from "../error/badrequestError";
import globalErrorHandler from "../middleware/globalErrorHandlingMiddleware.ts";

const router = Router();

router.use("/v1/tours", routerV1);

router.use("/v2/tours", routerV2);

router.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(
    new NotFoundError(`No resource or route defined for ${req.originalUrl}`)
  );
});

router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError) {
    next(new BadRequestError("Bad JSON"));
  }

  next(err);
});

router.use((err: APIError, req: Request, res: Response, next: NextFunction) => {
  if (globalErrorHandler.isTrustedError(err)) {
    return res
      .status(err.httpStatusCode)
      .json({ error: err.name, message: err.message });
  }

  globalErrorHandler.handleAPIError(err);

  res.status(500).json({
    error: "INTERNAL SERVER ERROR",
    message:
      "Oops! Sorry an error occured on our end, we cannot process your request at this time. Please try again shortly.",
  });
});

export default router;
