import APIError from "../error/apiError";
import logger from "../service/loggerService";
import notificationHandler from "../utils/notificationHandler/notificationHandler";

class GlobalErrorHandlingMiddleware {
  public async handleAPIError(err: Error): Promise<void> {
    console.log(err.name, err.message, err.stack);

    // logger.error(`name: ${err.name}\n message: ${err.message}`);

    // await notificationHandler.notifyAdmin();
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
