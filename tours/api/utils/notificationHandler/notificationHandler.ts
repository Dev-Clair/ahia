import SendEmail from "../../service/mailService";

const notifyAdmin = async (
  subject: String,
  body: String,
  toAddresses: String,
  ccAddresses?: String,
  bccAddresses?: String
) => {};

const notifyRealtor = async (
  subject: String,
  body: String,
  toAddresses: String,
  ccAddresses?: String,
  bccAddresses?: String
) => {};

const notifyCustomer = async (
  subject: String,
  body: String,
  toAddresses: String,
  ccAddresses?: String,
  bccAddresses?: String
) => {};

export default { notifyAdmin, notifyRealtor, notifyCustomer };
