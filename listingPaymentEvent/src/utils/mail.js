const Mailer = require("../service/mailer");
const MailerError = require("../error/mailer");
const Retry = require("./retry");

const Mail = async (sender, recipient, subject, text) => {
  try {
    await Retry.LinearJitterBackoff(() =>
      Mailer.Create().SendMail(sender, recipient, subject, text)
    );
  } catch (err) {
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

module.exports = Mail;
