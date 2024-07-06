const SendEmail = require("../service/mailer");
const Retry = require("./retry");

const Notify = async (from, to, subject, text, cc, bcc) => {
  console.log(from, to, subject, text);
};

module.exports = Notify;
