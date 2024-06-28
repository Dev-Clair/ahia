import Logger from "../../service/loggerService";

const ExponentialRetry = async (
  operation: any,
  options = { retries: 3, factor: 2, minTimeout: 7500 }
): Promise<any> => {
  const asyncRetry = await import("async-retry");
  return asyncRetry.default(
    async (bail, attempt) => {
      try {
        return await operation();
      } catch (error: any) {
        Logger.error(
          `Exponential retry attempt ${attempt} failed.\nError: ${error.message}`
        );
        throw error;
      }
    },
    {
      retries: options.retries,
      factor: options.factor,
      minTimeout: options.minTimeout,
      onRetry: (error, attempt) => {
        Logger.error(
          `Exponential retry attempt ${attempt} failed.\nThere are ${
            options.retries - attempt
          } retries left.\nError: ${error.message}`
        );
      },
    }
  );
};

const LinearJitterRetry = async (
  operation: any,
  options = { retries: 2, minTimeout: 5000, jitterFactor: 1000 }
): Promise<any> => {
  const asyncRetry = await import("async-retry");
  return asyncRetry.default(
    async (bail, attempt) => {
      try {
        return await operation();
      } catch (error: any) {
        const jitter = Math.random() * options.jitterFactor;
        Logger.error(
          `Linear jitter retry attempt ${attempt} failed.\nError: ${
            error.message
          }.\nNext retry in ${options.minTimeout + jitter}ms`
        );
        throw error;
      }
    },
    {
      retries: options.retries,
      minTimeout: options.minTimeout,
      onRetry: (error, attempt) => {
        const jitter = Math.random() * options.jitterFactor;
        Logger.error(
          `Linear jitter retry attempt ${attempt} failed.\nError: ${
            error.message
          }.\nNext retry in ${options.minTimeout + jitter}ms`
        );
        return options.minTimeout + jitter;
      },
    }
  );
};

const LinearRetry = async (
  operation: any,
  options = { retries: 5, minTimeout: 7500 }
): Promise<any> => {
  const asyncRetry = await import("async-retry");
  return asyncRetry.default(
    async (bail, attempt) => {
      try {
        return await operation();
      } catch (error: any) {
        Logger.error(
          `Linear retry attempt ${attempt} failed.\nError: ${error.message}.\nNext retry in ${options.minTimeout}ms`
        );
        throw error;
      }
    },
    {
      retries: options.retries,
      minTimeout: options.minTimeout,
      onRetry: (error, attempt) => {
        Logger.error(
          `Linear retry attempt ${attempt} failed.\nError: ${error.message}.\nNext retry in ${options.minTimeout}ms`
        );
        return options.minTimeout;
      },
    }
  );
};

export default { ExponentialRetry, LinearJitterRetry, LinearRetry };
