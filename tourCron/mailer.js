const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const Config = require("./config");

const configuration = [
  {
    region: Config.AWS_REGION,
    credentials: {
      accessKeyId: Config.AWS_ACCESS_KEY_ID,
      secretAccessKey: Config.AWS_SECRET_ACCESS_KEY,
    },
  },
];

const client = new SESClient(configuration);

const Mailer = async (
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
  };

  const command = new SendEmailCommand(input);

  const response = await client.send(command);

  return response;
};

module.exports = Mailer;
