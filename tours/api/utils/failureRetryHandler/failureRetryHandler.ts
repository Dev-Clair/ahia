import pRetry from "p-retry";
import asyncRetry from "async-retry";

const exponentialRetry = async (
  operation: Promise<void>,
  retries: number = 3,
  factor: number = 2,
  minTimeout: number = 5000
): Promise<void> => {
  await pRetry(
    async () => {
      await operation;
    },
    {
      retries: retries,
      factor: factor,
      minTimeout: minTimeout,
      onFailedAttempt: (err) => {
        console.error(
          `Exponential retry attempt ${err.attemptNumber} failed.\n There are ${err.retriesLeft} retries left.\n Error: ${err.message}`
        );
      },
    }
  );
};

const linearJitterRetry = async (
  operation: Promise<void>,
  retries: number = 2,
  minTimeout: number = 5000,
  jitterFactor: number = 1000
): Promise<void> => {
  await asyncRetry(
    async () => {
      await operation;
    },
    {
      retries: retries,
      minTimeout: minTimeout,
      onRetry: (err, attempt) => {
        const jitter = Math.random() * jitterFactor;

        console.error(
          `Linear jitter retry attempt ${attempt} failed.\n Error: ${
            err.message
          }.\n Next retry in ${minTimeout + jitter}ms`
        );
        return minTimeout + jitter;
      },
    }
  );
};

export default { exponentialRetry, linearJitterRetry };
