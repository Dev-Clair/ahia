import {
  SESClient,
  SESClientConfig,
  SendEmailCommand,
  SendEmailCommandInput,
  SendEmailCommandOutput,
} from "@aws-sdk/client-ses";
import Config from "../../config";

/**
 * Mailer service
 * @method SendMail
 * @method Create
 */
class MailerService {
  private client: SESClient;

  private constructor(configuration: SESClientConfig) {
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
  public async SendMail(
    sender: string,
    recipient: string[],
    subject: string,
    text: string,
    html?: string,
    cc?: string[],
    bcc?: string[]
  ): Promise<SendEmailCommandOutput> {
    const input: SendEmailCommandInput = {
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
   * Creates and returns a new instance of the MailerService class
   * @returns MailerService
   */
  public static Create(): MailerService {
    const configuration: SESClientConfig = {
      region: Config.AWS.REGION,
      credentials: {
        accessKeyId: Config.AWS.IAM.ACCESS_KEY_ID,
        secretAccessKey: Config.AWS.IAM.SECRET_ACCESS_KEY,
      },
    };

    return new MailerService(configuration);
  }
}

export default MailerService;
