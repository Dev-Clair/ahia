import TourModel from "../../model/tourModel";
import SendEmail from "../../service/mailService";
import retryHandler from "../retryHandler/retryHandler";

const notifyAdmin = async (
  subject: String,
  body: String,
  toAddresses: [String],
  ccAddresses?: [String],
  bccAddresses?: [String]
) => {
  console.log(subject, body, toAddresses);
};

const notifyRealtor = async (
  subject: String,
  body: String,
  toAddresses: [String],
  ccAddresses?: [String],
  bccAddresses?: [String]
) => {
  console.log(subject, body, toAddresses);
};

const notifyCustomer = async (
  subject: String,
  body: String,
  toAddresses: [String],
  ccAddresses?: [String],
  bccAddresses?: [String]
) => {
  console.log(subject, body, toAddresses);
};

export default { notifyAdmin, notifyRealtor, notifyCustomer };
