class MailerError extends Error {
  name;

  description;

  constructor(message, description = "AWS SES ERROR") {
    super(message);

    this.name = "MAILER ERROR";

    this.description = description;
  }
}

module.exports = MailerError;
