const Mail = require("./mailer");
const Retry = require("./retry");

const Notify = async (sender, recipient, subject, text) => {
  await Retry.LinearJitterRetry(() => Mail(sender, [recipient], subject, text));
};

module.exports = Notify;
