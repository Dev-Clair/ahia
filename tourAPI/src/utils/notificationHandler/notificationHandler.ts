import axios from "axios";
import SendEmail from "../../service/mailService";
import retryHandler from "../retryHandler/retryHandler";

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
