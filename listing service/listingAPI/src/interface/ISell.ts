import IListing from "./IListing";
import IPaymentOptions from "./IPaymentoptions";

export default interface ISell extends IListing {
  isNegotiable: boolean;
  paymentOptions: [IPaymentOptions];
}
