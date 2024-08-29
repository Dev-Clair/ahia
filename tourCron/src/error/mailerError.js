class MailerError extends Error {
  name;

  description;

  constructor(message, description = "AWS SES Exception") {
    super(message);

    this.name = "MAILER ERROR";

    this.description = description;

    Error.captureStackTrace(this);
  }
}

module.exports = MailerError;
