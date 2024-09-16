import AsyncRetry from "async-retry";
import IRetryOptions from "../interface/IRetryoptions";

class FailureRetry {
  static async ExponentialBackoff(
    operation: any,
    options: IRetryOptions = { retries: 3, factor: 2, minTimeout: 5000 }
  ): Promise<any> {
    return AsyncRetry(
      async (bail, attempt) => {
        return await operation();
      },
      {
        retries: options.retries,
        factor: options.factor,
        minTimeout: options.minTimeout,
        onRetry: (error, attempt) => {
          console.error(
            `Exponential retry attempt no. ${attempt} failed.\nThere are ${
              options.retries - attempt
            } retries left.\nError: ${error.message}`
          );
        },
      }
    );
  }

  static async ExponentialJitterBackoff(
    operation: any,
    options: IRetryOptions = {
      retries: 3,
      factor: 2,
      minTimeout: 2500,
      jitterFactor: 1000,
    }
  ): Promise<any> {
    return AsyncRetry(
      async (bail, attempt) => {
        return await operation();
      },
      {
        retries: options.retries,
        factor: options.factor,
        minTimeout: options.minTimeout,
        onRetry: (error, attempt) => {
          const jitter = Math.random() * (options as any).jitterFactor;

          const timeout =
            options.minTimeout *
              Math.pow((options as any).factor, attempt - 1) +
            jitter;

          console.error(
            `Exponential jitter retry attempt no. ${attempt} failed.\nError: ${error.message}.\nNext retry in ${timeout}ms`
          );

          return timeout;
        },
      }
    );
  }

  static async LinearBackoff(
    operation: any,
    options: IRetryOptions = { retries: 5, minTimeout: 2500 }
  ): Promise<any> {
    return AsyncRetry(
      async (bail, attempt) => {
        return await operation();
      },
      {
        retries: options.retries,
        minTimeout: options.minTimeout,
        onRetry: (error, attempt) => {
          console.error(
            `Linear retry attempt no. ${attempt} failed.\nError: ${error.message}.\nNext retry in ${options.minTimeout}ms`
          );
          return options.minTimeout;
        },
      }
    );
  }

  static async LinearJitterBackoff(
    operation: any,
    options: IRetryOptions = {
      retries: 5,
      minTimeout: 5000,
      jitterFactor: 1000,
    }
  ): Promise<any> {
    return AsyncRetry(
      async (bail, attempt) => {
        return await operation();
      },
      {
        retries: options.retries,
        minTimeout: options.minTimeout,
        onRetry: (error, attempt) => {
          const jitter = Math.random() * (options as any).jitterFactor;

          console.error(
            `Linear jitter retry attempt no. ${attempt} failed.\nError: ${
              error.message
            }.\nNext retry in ${options.minTimeout + jitter}ms`
          );

          return options.minTimeout + jitter;
        },
      }
    );
  }
}

export default FailureRetry;
