import SendMail from "../service/mailService";
import Retry from "./retry";

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
    throw new MailerError(err.message);
  }
};

export default Notify;
