import SendEmail from "../../service/mailService";
import RetryHandler from "../retryHandler/retryHandler";

const NotifyUser = async (
  from: string,
  toAddresses: [String],
  subject: String,
  text: String,
  ccAddresses?: [String],
  bccAddresses?: [String]
) => {
  console.log(from, subject, text, toAddresses);
};

export default NotifyUser;
