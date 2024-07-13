import Retry from "./retry";
import SendMail from "../service/mailService";

const Notify = async (
  sender: string,
  recipient: [string],
  subject: string,
  text: string
) => {
  try {
    await Retry.LinearJitterBackoff(() =>
      SendMail(sender, recipient, subject, text)
    );
  } catch (err: any) {
    if (
      err.name === "AccountSendingPaused" ||
      err.name === "ConfigurationSetDoesNotExist" ||
      err.name === "ConfigurationSetSendingPaused" ||
      err.name === "MailFromDomainNotVerified" ||
      err.name === "LimitExceeded"
    ) {
      return;
    } else {
      const error = err;

      throw new MailerError(error);
    }
  }
};

export default Notify;