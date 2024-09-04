import APIError from "./apiError";
import HttpCode from "../enum/httpCode";
import HttpStatus from "../enum/httpStatus";

class PaymentRequiredError extends APIError {
  constructor(message: string) {
    super(
      HttpStatus.PAYMENT_REQUIRED,
      HttpCode.PAYMENT_REQUIRED,
      true,
      message
    );
  }
}

export default PaymentRequiredError;
