import * as Sentry from "@sentry/node";
import express, { Request, Response, NextFunction } from "express";
import express_mongo_sanitize from "express-mongo-sanitize";
import helmet from "helmet";
import hpp from "hpp";
import APIError from "./src/error/apiError";
import GlobalErrorHandler from "./src/middleware/globalErrorHandlingMiddleware.ts";
import HttpCode from "./src/enum/httpCode";
import HttpStatus from "./src/enum/httpStatus";
import ListingRouter from "./src/router";

const App = express();

App.use(Sentry.expressErrorHandler());

App.use(express.json());

App.use(express.urlencoded({ extended: true }));

App.use(helmet());

App.use(hpp());

App.use(express_mongo_sanitize());

App.use("/api", ListingRouter);

App.use(
  (err: APIError | Error, req: Request, res: Response, next: NextFunction) => {
    if (GlobalErrorHandler.isSyntaxError(err)) {
      return res
        .status(HttpCode.BAD_REQUEST)
        .json({ error: { name: err.name, message: "Bad or Malformed JSON" } });
    }

    if (GlobalErrorHandler.isSafeError(err)) {
      if (err.name === "ValidationError") {
        return res.status(HttpCode.UNPROCESSABLE_ENTITY).json({
          error: { name: err.name, message: err.message },
        });
      } else if (err.name === "CastError") {
        return res.status(HttpCode.UNPROCESSABLE_ENTITY).json({
          error: { name: err.name, message: "Invalid ID format" },
        });
      } else {
        return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
          error: {
            name: err.name,
            message:
              "Oops! Sorry an error occured on our end, we cannot process your request at this time. Please try again shortly",
          },
        });
      }
    }

    if (GlobalErrorHandler.isTrustedError(err as APIError)) {
      return res
        .status((err as APIError).code)
        .json({ error: { name: err.name, message: err.message } });
    }

    GlobalErrorHandler.handleError(err);

    if (!res.headersSent) {
      return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        error: {
          name: HttpStatus.INTERNAL_SERVER_ERROR,
          message:
            "Oops! Sorry an error occured on our end, we cannot process your request at this time. Please try again shortly",
        },
      });
    }
  }
);

App.all("*", (req: Request, res: Response, next: NextFunction) => {
  return res.status(HttpCode.NOT_FOUND).json({
    error: {
      name: HttpStatus.NOT_FOUND,
      message: `No resource or route defined for ${req.originalUrl}`,
    },
  });
});

export default App;
