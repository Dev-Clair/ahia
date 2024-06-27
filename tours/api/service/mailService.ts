import {
  SESClient,
  SESClientConfig,
  SendEmailCommand,
} from "@aws-sdk/client-ses";

const configuration: SESClientConfig = [];

const client: SESClient = new SESClient(configuration);

const SendEmail = async (
  message: string,
  text: string,
  html: string,
  from: string,
  to: [string],
  cc?: [string],
  bcc?: [string]
) => {
  const createInput = {
    Source: from,
    Destination: {
      ToAddresses: to,
      CcAddresses: cc,
      BccAddresses: bcc,
    },
    Message: {
      Subject: {
        Data: message,
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
    // ReplyToAddresses: [],
    // ReturnPath: "",
    SourceArn: "",
    // ReturnPathArn: "",
    // Tags: [
    //   {
    //     Name: "",
    //     Value: "",
    //   },
    // ],
    // ConfigurationSetName: "",
  };

  const command = new SendEmailCommand(createInput);

  const response = await client.send(command);

  return response;
};

export default SendEmail;
