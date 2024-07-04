const SendEmail = require("./mailer");
const RetryHandler = require("./retryHandler");

const NotifyAdmin = async (from, to, subject, text, cc, bcc) => {
  console.log(from, to, subject, text);
};

module.exports = NotifyAdmin;
