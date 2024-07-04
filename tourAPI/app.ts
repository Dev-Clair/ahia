import express, { Request, Response, Router, NextFunction } from "express";
import helmet from "helmet";
import hpp from "hpp";
import express_mongo_sanitize from "express-mongo-sanitize";
import TourRouter from "./src/router";
import HttpStatusCode from "./src/enum/httpStatusCode";
import APIError from "./src/error/apiError";
import GlobalErrorHandler from "./src/middleware/globalErrorHandlingMiddleware.ts";

const App = express();

App.use(express.json());

App.use(express.urlencoded({ extended: true }));

App.use(helmet());

App.use(hpp());

App.use(express_mongo_sanitize());

App.use("/api", TourRouter);

App.all("*", (req: Request, res: Response, next: NextFunction) => {
  return res
    .status(HttpStatusCode.NOT_FOUND)
    .json({ message: `No resource or route defined for ${req.originalUrl}` });
});

App.use(
  (err: APIError | Error, req: Request, res: Response, next: NextFunction) => {
    if (GlobalErrorHandler.isSyntaxError(err)) {
      return res
        .status(HttpStatusCode.BAD_REQUEST)
        .json({ error: err.name, message: "Bad or Malformed JSON" });
    }

    if (GlobalErrorHandler.isSafeError(err)) {
      if (err.name === "ValidationError") {
        return res.status(HttpStatusCode.UNPROCESSABLE_ENTITY).json({
          error: err.name,
          message: err.message,
        });
      } else if (err.name === "CastError") {
        return res.status(HttpStatusCode.UNPROCESSABLE_ENTITY).json({
          error: err.name,
          message: "Invalid ID format",
        });
      } else {
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          error: err.name,
          message:
            "Oops! Sorry an error occured on our end, we cannot process your request at this time. Please try again shortly",
        });
      }
    }

    if (GlobalErrorHandler.isTrustedError(err as APIError)) {
      return res
        .status((err as APIError).httpStatusCode)
        .json({ error: err.name, message: err.message });
    }

    GlobalErrorHandler.handleError(err);

    if (!res.headersSent) {
      return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        error: "INTERNAL SERVER ERROR",
        message:
          "Oops! Sorry an error occured on our end, we cannot process your request at this time. Please try again shortly",
      });
    }
  }
);

export default App;
