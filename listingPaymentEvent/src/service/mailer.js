import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import Config from "../../config";

/**
 * Mailer
 * @method SendMail
 * @method Create
 */
class Mailer {
  client;

  constructor(configuration) {
    this.client = new SESClient(configuration);
  }

  /**
   * Sends an email using AWS SES.
   * @param sender - The sender's email address.
   * @param recipient - An array of recipient email addresses.
   * @param subject - The subject of the email.
   * @param text - The plain text content of the email.
   * @param html - The HTML content of the email (optional).
   * @param cc - An array of CC email addresses (optional).
   * @param bcc - An array of BCC email addresses (optional).
   * @returns Promise<SendEmailCommandOutput>
   */
  async SendMail(sender, recipient, subject, text, html, cc, bcc) {
    const input = {
      Source: sender,
      Destination: {
        ToAddresses: recipient,
        CcAddresses: cc,
        BccAddresses: bcc,
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: text,
            Charset: "UTF-8",
          },
          Html: html
            ? {
                Data: html,
                Charset: "UTF-8",
              }
            : undefined,
        },
      },
    };

    const command = new SendEmailCommand(input);
    return this.client.send(command);
  }

  /**
   * Creates and returns a new instance of the Mailer class
   * @returns Mailer
   */
  static Create() {
    const configuration = {
      region: Config.AWS.REGION,
      credentials: {
        accessKeyId: Config.AWS.IAM.ACCESS_KEY_ID,
        secretAccessKey: Config.AWS.IAM.SECRET_ACCESS_KEY,
      },
    };

    return new Mailer(configuration);
  }
}

export default Mailer;
