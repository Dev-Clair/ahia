const MailerError = require("./mailerError");
const Retry = require("./retry");
const SendMail = require("./mailer");

const Notify = async (sender, recipient, subject, text) => {
  try {
    await Retry.LinearJitterBackoff(() =>
      SendMail(sender, recipient, subject, text)
    );
  } catch (err) {
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

module.exports = Notify;
