export default interface IRetryOptions {
  retries: number;
  minTimeout: number;
  factor?: number | undefined;
  jitterFactor?: number | undefined;
}
