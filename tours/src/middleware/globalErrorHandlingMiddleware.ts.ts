import BaseError from "../error/baseError";

class GlobalErrorHandlingMiddleware {
  public async handleAPIError(err: Error): Promise<void> {
    console.log(err);

    // Send mail or sms notification to admin
    // await sendErrorNotOperationalMail();
  }

  public isTrustedError(err: Error): Boolean {
    if (err instanceof BaseError) {
      return err.isOperational;
    }

    return false;
  }
}

const globalErrorHandler = GlobalErrorHandlingMiddleware;

export default new globalErrorHandler();
