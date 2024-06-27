import pRetry from "p-retry";
import asyncRetry from "async-retry";

const ExponentialRetry = async (
  operation: any,
  options = { retries: 3, factor: 2, minTimeout: 7500 }
) => {
  await pRetry(
    async () => {
      await operation();
    },
    {
      retries: options.retries,
      factor: options.factor,
      minTimeout: options.minTimeout,
      onFailedAttempt: (err) => {
        console.error(
          `${__filename}: Exponential retry attempt ${err.attemptNumber} failed.\nThere are ${err.retriesLeft} retries left.\nError: ${err.message}`
        );
      },
    }
  );
};

const LinearJitterRetry = async (
  operation: any,
  options = { retries: 2, minTimeout: 5000, jitterFactor: 1000 }
) => {
  await asyncRetry(
    async (err, attempt) => {
      await operation();
    },
    {
      retries: options.retries,
      minTimeout: options.minTimeout,
      onRetry: (err, attempt) => {
        const jitter = Math.random() * options.jitterFactor;

        console.error(
          `${__filename}: Linear jitter retry attempt ${attempt} failed.\nError: ${
            err.message
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
) => {
  await asyncRetry(
    async (err, attempt) => {
      await operation();
    },
    {
      retries: options.retries,
      minTimeout: options.minTimeout,
      onRetry: (err, attempt) => {
        console.error(
          `${__filename}: Linear retry attempt ${attempt} failed.\nError: ${err.message}.\nNext retry in ${options.minTimeout}ms`
        );
        return options.minTimeout;
      },
    }
  );
};

export { ExponentialRetry, LinearJitterRetry, LinearRetry };
