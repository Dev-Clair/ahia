class MailerError extends Error {
  public readonly name;

  public readonly description;

  constructor(message: string, description: string = "AWS SES ERROR") {
    super(message);

    this.name = "MAILER ERROR";

    this.description = description;
  }
}

module.exports = MailerError;
