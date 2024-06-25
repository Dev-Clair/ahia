import pRetry from "p-retry";
import asyncRetry from "async-retry";

const ExponentialRetry = async (
  operation: Function | any,
  options = { retries: 3, factor: 2, minTimeout: 7500 }
): Promise<void> => {
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
          `Exponential retry attempt ${err.attemptNumber} failed.\n There are ${err.retriesLeft} retries left.\n Error: ${err.message}`
        );
      },
    }
  );
};

const LinearJitterRetry = async (
  operation: Function | any,
  options = { retries: 2, minTimeout: 5000, jitterFactor: 1000 }
): Promise<void> => {
  await asyncRetry(
    async (bail, attempt) => {
      await operation();
    },
    {
      retries: options.retries,
      minTimeout: options.minTimeout,
      onRetry: (err, attempt) => {
        const jitter = Math.random() * options.jitterFactor;

        console.error(
          `Linear jitter retry attempt ${attempt} failed.\n Error: ${
            err.message
          }.\n Next retry in ${options.minTimeout + jitter}ms`
        );
        return options.minTimeout + jitter;
      },
    }
  );
};

export default { ExponentialRetry, LinearJitterRetry };
