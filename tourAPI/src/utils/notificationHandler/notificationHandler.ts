import SendEmail from "../../service/mailService";
import RetryHandler from "../retryHandler/retryHandler";

const NotifyUser = async (
  from: string,
  to: [String],
  subject: String,
  text: String,
  cc?: [String],
  bcc?: [String]
) => {
  console.log(from, to, subject, text);
};

export default NotifyUser;
