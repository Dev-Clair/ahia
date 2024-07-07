const SendMail = require("./mailer");
const MailerError = require("./mailerError");
const Retry = require("./retry");

const Notify = async (sender, recipient, subject, text) => {
  try {
    await Retry.LinearJitterBackoff(() =>
      SendMail(sender, recipient, subject, text)
    );
  } catch (err) {
    throw new MailerError(err.message);
  }
};

module.exports = Notify;
