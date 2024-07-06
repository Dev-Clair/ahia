const {
  SESClient,
  SESClientConfig,
  SendEmailCommand,
} = require("@aws-sdk/client-ses");

const configuration = [];

const client = new SESClient(configuration);

const Mail = async (from, to, subject, text, html, cc, bcc) => {
  console.log(from, to, subject, text, html, cc, bcc);

  // const input = {
  //   Source: from,
  //   Destination: {
  //     ToAddresses: to,
  //     CcAddresses: cc,
  //     BccAddresses: bcc,
  //   },
  //   Message: {
  //     Subject: {
  //       Data: subject,
  //       Charset: "UTF-8",
  //     },
  //     Body: {
  //       Text: {
  //         Data: text,
  //         Charset: "UTF-8",
  //       },
  //       Html: {
  //         Data: html,
  //         Charset: "UTF-8",
  //       },
  //     },
  //   },
  //   // ReplyToAddresses: [],
  //   // ReturnPath: "",
  //   SourceArn: "",
  //   // ReturnPathArn: "",
  //   // Tags: [
  //   //   {
  //   //     Name: "",
  //   //     Value: "",
  //   //   },
  //   // ],
  //   // ConfigurationSetName: "",
  // };

  // const command = new SendEmailCommand(input);

  // const response = await client.send(command);

  // return response;
};

module.exports = Mail;
