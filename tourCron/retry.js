const asyncRetry = require("async-retry");

const ExponentialRetry = async (
  operation,
  options = { retries: 3, factor: 2, minTimeout: 7500 }
) => {
  return asyncRetry.default(
    async (bail, attempt) => {
      return await operation();
    },
    {
      retries: options.retries,
      factor: options.factor,
      minTimeout: options.minTimeout,
      onRetry: (error, attempt) => {
        console.error.error(
          `Exponential retry attempt no. ${attempt} failed.\nThere are ${
            options.retries - attempt
          } retries left.\nError: ${error.message}`
        );
      },
    }
  );
};

const LinearJitterRetry = async (
  operation,
  options = { retries: 2, minTimeout: 5000, jitterFactor: 1000 }
) => {
  return asyncRetry.default(
    async (bail, attempt) => {
      return await operation();
    },
    {
      retries: options.retries,
      minTimeout: options.minTimeout,
      onRetry: (error, attempt) => {
        const jitter = Math.random() * options.jitterFactor;
        console.error(
          `Linear jitter retry attempt no. ${attempt} failed.\nError: ${
            error.message
          }.\nNext retry in ${options.minTimeout + jitter}ms`
        );
        return options.minTimeout + jitter;
      },
    }
  );
};

const LinearRetry = async (
  operation,
  options = { retries: 5, minTimeout: 7500 }
) => {
  return asyncRetry.default(
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
};

module.exports = { ExponentialRetry, LinearJitterRetry, LinearRetry };
