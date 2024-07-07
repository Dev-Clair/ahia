import {
  SESClient,
  SESClientConfig,
  SendEmailCommand,
} from "@aws-sdk/client-ses";
import Config from "../../config";

const configuration: SESClientConfig = [
  {
    region: Config.AWS_REGION,
    credentials: {
      accessKeyId: Config.AWS_ACCESS_KEY_ID,
      secretAccessKey: Config.AWS_SECRET_ACCESS_KEY,
    },
  },
];

const client: SESClient = new SESClient(configuration);

const SendEmail = async (
  sender: string,
  recipient: [string],
  subject: string,
  text: string,
  html?: string,
  cc?: [string],
  bcc?: [string]
) => {
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
        Html: {
          Data: html,
          Charset: "UTF-8",
        },
      },
    },
  };

  const command = new SendEmailCommand(input);

  const response = await client.send(command);

  return response;
};

export default SendEmail;
