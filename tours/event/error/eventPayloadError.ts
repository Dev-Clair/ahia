class EventPayloadError extends Error {
  public readonly isOperational: Boolean;

  constructor(message: string) {
    super(message);

    this.name = "EventPayloadError";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default EventPayloadError;
