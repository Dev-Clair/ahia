import APIError from "../error/apiError";

class GlobalErrorHandlingMiddleware {
  public async handleAPIError(err: Error): Promise<void> {
    console.log(err);

    // Send mail or sms notification to admin
    // await notifyAdmin();
  }

  public isTrustedError(err: Error): Boolean {
    if (err instanceof APIError) {
      return err.isOperational;
    }

    return false;
  }
}

const GlobalErrorHandler = new GlobalErrorHandlingMiddleware();

export default GlobalErrorHandler;
