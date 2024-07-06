const {
  SESClient,
  SESClientConfig,
  SendEmailCommand,
} = require("@aws-sdk/client-ses");

const configuration = [];

const client = new SESClient(configuration);

const Mail = async (
  sender,
  recipient,
  subject,
  text,
  html = "",
  cc = [""],
  bcc = [""]
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
    SourceArn: "",
  };

  const command = new SendEmailCommand(input);

  const response = await client.send(command);

  return response;
};

module.exports = Mail;
