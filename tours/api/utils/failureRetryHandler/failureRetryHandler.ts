import pRetry from "p-retry";
import asyncRetry from "async-retry";

const exponentialRetry = async (
  operation: Function,
  retries: number,
  factor: number,
  minTimeout: number
) => {
  await pRetry(
    async () => {
      await operation();
    },
    {
      retries: retries,
      factor: factor,
      minTimeout: minTimeout,
      onFailedAttempt: (err) => {
        console.log(
          `Exponential retry attempt ${err.attemptNumber} failed. There are ${err.retriesLeft} retries left. Error: ${err.message}`
        );
      },
    }
  );
};

const linearJitterRetry = async (
  operation: Function,
  retries: number,
  minTimeout: number,
  jitterFactor: number
) => {
  await asyncRetry(
    async () => {
      await operation();
    },
    {
      retries: retries,
      minTimeout: minTimeout,
      onRetry: (err, attempt) => {
        const jitter = Math.random() * jitterFactor;

        console.log(
          `Linear jitter retry attempt ${attempt} failed. Error: ${
            err.message
          }. Next retry in ${5000 + jitter}ms`
        );
        return 5000 + jitter;
      },
    }
  );
};

export default { exponentialRetry, linearJitterRetry };
