import Mailer from "../service/mailService";
import MailerError from "../error/mailerError";
import Retry from "./retry";

const Mail = async (
  sender: string,
  recipient: [string],
  subject: string,
  text: string
) => {
  try {
    await Retry.LinearJitterBackoff(() =>
      Mailer(sender, recipient, subject, text)
    );
  } catch (err: any) {
    if (
      err.name === "AccountSendingPaused" ||
      err.name === "ConfigurationSetDoesNotExist" ||
      err.name === "ConfigurationSetSendingPaused" ||
      err.name === "MailFromDomainNotVerified" ||
      err.name === "LimitExceeded"
    ) {
      const error = err;
      throw new MailerError(error);
    } else {
      console.log(err.name);
      return;
    }
  }
};

export default Mail;
