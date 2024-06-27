class PaymentEventPayloadError extends Error {
  public readonly isOperational: Boolean;

  constructor(message: string) {
    super(message);

    this.name = "PaymentEventPayloadError";
    this.isOperational = false;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default PaymentEventPayloadError;
