import { NextFunction, Request, Response } from "express";
import APIError from "../error/apiError";

class GlobalErrorHandlingMiddleware {
  constructor(
    public readonly err: Error,
    public readonly req: Request,
    public readonly res: Response,
    public readonly next: NextFunction
  ) {}

  public async handleAPIError(): Promise<void> {
    console.log(this.err);

    // Send mail or sms notification to admin
    // await sendErrorNotOperationalMail();
  }

  public isTrustedError(): Boolean | Response {
    if (this.err instanceof APIError && this.err.isOperational) {
      return this.res
        .status(this.err.errorCode || 500)
        .json({ error: this.err.name, message: this.err.message });
    }

    return false;
  }
}

const globalErrorHandler = GlobalErrorHandlingMiddleware;

export default globalErrorHandler;
