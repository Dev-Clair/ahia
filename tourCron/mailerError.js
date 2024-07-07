class MailerError extends Error {
  name;

  description;

  constructor(message, description = "") {
    super(message);

    this.name = "MAILER ERROR";

    this.description = description;
  }
}

module.exports = MailerError;
