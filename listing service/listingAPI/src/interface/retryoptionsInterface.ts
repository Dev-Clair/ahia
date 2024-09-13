export default interface RetryOptionsInterface {
  retries: number;
  minTimeout: number;
  factor?: number | undefined;
  jitterFactor?: number | undefined;
}
